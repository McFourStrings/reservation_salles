<?php

namespace App\Controller\Api; 

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse; 
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/salle', name: 'api_salle_')] 
final class SalleController extends AbstractController
{
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Bienvenue sur l\'API salle',
            'status' => 'success'
        ]);
    }
}