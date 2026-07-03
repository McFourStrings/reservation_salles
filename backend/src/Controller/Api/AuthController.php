<?php

namespace App\Controller\Api;

use App\Repository\UtilisateurRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        UtilisateurRepository $userRepo,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        // 1. Récupération des données JSON
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['error' => 'Identifiants manquants.'], Response::HTTP_BAD_REQUEST);
        }

        // 2. Chercher l'utilisateur en BDD
        $user = $userRepo->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['error' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
        }

        // 3. Vérifier le mot de passe (en comparant le clair avec le hash de la BDD)
        $isValid = $passwordHasher->isPasswordValid($user, $password);

        if (!$isValid) {
            return $this->json(['error' => 'Identifiants invalides.'], Response::HTTP_UNAUTHORIZED);
        }

        // 4. Générer le Token JWT manuellement grâce au bundle
        $token = $jwtManager->create($user);

        // 5. Retourner le token tout beau tout propre !
        return $this->json([
            'token' => $token
        ], Response::HTTP_OK);
    }
}