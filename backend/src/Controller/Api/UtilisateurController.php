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
                'role' => $user->getRole()?->value, // .value permet de récupérer la string l'Enum
                'date_creation' => $user->getDateCreation()?->format('d-m-Y')
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }


    #[Route('/get_one/{id}', name: 'get_one', methods: ['GET'])]
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
            'date_creation' => $user->getDateCreation()?->format('d-m-Y')
        ];

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    public function update(
        ?Utilisateur $user,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!empty($data['nom'])) {
            $user->setNom($data['nom']);
        }
        if (!empty($data['prenom'])) {
            $user->setPrenom($data['prenom']);
        }
        if (!empty($data['email'])) {
            $user->setEmail($data['email']);
        }


        $em->flush();

        return $this->json([
            'message' => 'Utilisateur mis à jour avec succès !',
            'user' => [
                'id' => $user->getId(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'email' => $user->getEmail(),
                'role' => $user->getRole()?->value
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(?Utilisateur $user, EntityManagerInterface $em): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($user);
        $em->flush();

        return $this->json([
            'message' => sprintf('L\'utilisateur %s %s a été supprimé avec succès !', $user->getPrenom(), $user->getNom())
        ], Response::HTTP_OK);
    }
}
