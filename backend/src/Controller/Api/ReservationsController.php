<?php

namespace App\Controller\Api; 

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse; 
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reservations', name: 'api_reservations_')] 
final class ReservationsController extends AbstractController
{
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Bienvenue sur l\'API reservations',
            'status' => 'success'
        ]);
    }
}