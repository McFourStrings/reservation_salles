<?php

namespace App\Controller\Api;

use App\Entity\Utilisateur;
use App\Enum\UserRole;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/utilisateur', name: 'api_utilisateur_')]
final class UtilisateurController extends AbstractController
{
    #[Route('/inscription', name: 'inscription', methods: ['POST'])]
    public function inscription(
        Request $request,
        EntityManagerInterface $em,
        UtilisateurRepository $utilisateurRepository,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password']) || empty($data['nom']) || empty($data['prenom'])) {
            return $this->json(['error' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        $existingUser = $utilisateurRepository->findOneBy(['email' => $data['email']]);

        if ($existingUser) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $utilisateur = new Utilisateur();
        $utilisateur->setNom($data['nom']);
        $utilisateur->setPrenom($data['prenom']);
        $utilisateur->setEmail($data['email']);
        $hashedPassword = $passwordHasher->hashPassword(
            $utilisateur,
            $data['password']
        );
        $utilisateur->setPassword($hashedPassword);
        $utilisateur->setRole(UserRole::CLIENT);

        $em->persist($utilisateur);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur inscrit avec succès !',
            'id' => $utilisateur->getId()
        ], Response::HTTP_CREATED);
    }

    #[Route('/get_all', name: 'get_all', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function getAll(UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        //  Récupérer tous les utilisateurs depuis la BDD
        $utilisateurs = $utilisateurRepository->findAll();

        // Formater les données en tableau simple pour éviter les boucles infinies
        $data = [];
        foreach ($utilisateurs as $user) {
            $data[] = [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'email' => $user->getEmail(),
                'role' => $user->getRole()?->value
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }


    #[Route('/get_one/{id}', name: 'get_one', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function getOne(int $id, UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        $user = $utilisateurRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(),
            'role' => $user->getRole()?->value,
        ];

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/me', name: 'me_profile', methods: ['GET'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Vous devez être connecté.')]
    public function getMe(): JsonResponse
    {
        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();

        $data = [
            'id' => $currentUser->getId(),
            'nom' => $currentUser->getNom(),
            'prenom' => $currentUser->getPrenom(),
            'email' => $currentUser->getEmail(),
            'role' => $currentUser->getRole()?->value,
            'date_creation' => $currentUser->getDateCreation()?->format('d-m-Y')
        ];

        return $this->json($data, Response::HTTP_OK);
    }


    #[Route('/me/update', name: 'me_update', methods: ['PUT'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Vous devez être connecté.')]
    public function updateMe(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!empty($data['nom'])) {
            $currentUser->setNom($data['nom']);
        }
        if (!empty($data['prenom'])) {
            $currentUser->setPrenom($data['prenom']);
        }
        if (!empty($data['email'])) {
            $currentUser->setEmail($data['email']);
        }
        if (!empty($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($currentUser, $data['password']);
            $currentUser->setPassword($hashedPassword);
        }

        $em->flush();

        return $this->json([
            'message' => 'Vos informations ont été mises à jour avec succès !',
            'user' => [
                'id' => $currentUser->getId(),
                'nom' => $currentUser->getNom(),
                'prenom' => $currentUser->getPrenom(),
                'email' => $currentUser->getEmail()
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/me/delete', name: 'me_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Vous devez être connecté.')]
    public function deleteMe(EntityManagerInterface $em): JsonResponse
    {
        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();

        // Stockage temporaire des infos pour le message avant suppression
        $nomComplet = $currentUser->getPrenom() . ' ' . $currentUser->getNom();

        $em->remove($currentUser);
        $em->flush();

        return $this->json([
            'message' => sprintf('Votre compte (%s) a été supprimé avec succès !', $nomComplet)
        ], Response::HTTP_OK);
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]
    public function delete(?Utilisateur $utilisateur, EntityManagerInterface $em): JsonResponse
    {
        if (!$utilisateur) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        /** @var Utilisateur $currentUser */
        $currentUser = $this->getUser();

        // On empêche l'admin de se supprimer lui-même
        if ($currentUser->getId() === $utilisateur->getId()) {
            return $this->json([
                'error' => 'Action impossible. Vous ne pouvez pas supprimer votre propre compte administrateur depuis cette route.'
            ], Response::HTTP_BAD_REQUEST);
        }
        $em->remove($utilisateur);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur supprimé avec succès!'
        ], Response::HTTP_OK);
    }
}
