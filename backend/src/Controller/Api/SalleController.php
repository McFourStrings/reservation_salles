<?php

namespace App\Controller\Api;

use App\Entity\Salle;
use App\Repository\SalleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/salle', name: 'api_salle_')]
final class SalleController extends AbstractController
{
    #[Route('/create_room', name: 'create_room', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. .')]

    public function create_room(
        Request $request,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nom']) || empty($data['capacite']) || empty($data['localisation'])) {
            return $this->json(['error' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        $salle = new Salle();
        $salle->setNom($data['nom']);
        $salle->setCapacite($data['capacite']);
        $salle->setDescription($data['description'] ?? null);
        $salle->setLocalisation($data['localisation']);
        $salle->setEquipements($data['equipements'] ?? null);
        $salle->setDisponibilité(true);

        $em->persist($salle);
        $em->flush();

        return $this->json([
            'message' => 'Salle créée avec succès !',
            'id' => $salle->getId()
        ], Response::HTTP_CREATED);
    }

    #[Route('/getAllRooms', name: 'getAllRooms', methods: ['GET'])]
    public function getAll(SalleRepository $salleRepository): JsonResponse
    {
        $salles = $salleRepository->findBy(['disponibilité' => true]);

        $data = [];
        foreach ($salles as $salle) {
            $data[] = [
                'id' => $salle->getId(),
                'nom' => $salle->getNom(),
                'capacite' => $salle->getCapacite(),
                'description' => $salle->getDescription(),
                'localisation' => $salle->getLocalisation(),
                'equipements' => $salle->getEquipements(),
                'disponibilité' => $salle->isDisponibilité()
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/get_one/{id}', name: 'get_one', methods: ['GET'])]
    public function getOne(int $id, SalleRepository $salleRepository): JsonResponse
    {
        $salle = $salleRepository->find($id);

        if (!$salle || !$salle->isDisponibilité()) {
            return $this->json(['error' => 'Salle non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $salle->getId(),
            'nom' => $salle->getNom(),
            'capacite' => $salle->getCapacite(),
            'description' => $salle->getDescription(),
            'localisation' => $salle->getLocalisation(),
            'equipements' => $salle->getEquipements(),
            'disponibilité' => $salle->isDisponibilité()
        ];

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function update(
        ?Salle $salle,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$salle) {
            return $this->json(['error' => 'Salle non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!empty($data['nom'])) {
            $salle->setNom($data['nom']);
        }
        if (!empty($data['capacite'])) {
            $salle->setCapacite($data['capacite']);
        }
        if (array_key_exists('description', $data)) {
            $salle->setDescription($data['description']);
        }
        if (!empty($data['localisation'])) {
            $salle->setLocalisation($data['localisation']);
        }
        if (array_key_exists('equipements', $data)) {
            $salle->setEquipements($data['equipements']);
        }
        if (isset($data['disponibilité'])) {
            $salle->setDisponibilité($data['disponibilité']);
        }

        $em->flush();

        return $this->json([
            'message' => 'Salle mise à jour avec succès !',
            'salle' => [
                'id' => $salle->getId(),
                'nom' => $salle->getNom(),
                'capacite' => $salle->getCapacite(),
                'description' => $salle->getDescription(),
                'localisation' => $salle->getLocalisation(),
                'equipements' => $salle->getEquipements(),
                'disponibilité' => $salle->isDisponibilité()

            ]
        ], Response::HTTP_OK);
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function delete(?Salle $salle, EntityManagerInterface $em): JsonResponse
    {
        if (!$salle) {
            return $this->json(['error' => 'Salle non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if (!$salle->isDisponibilité()) {
            return $this->json(['message' => 'Cette salle est déjà désactivée.'], Response::HTTP_BAD_REQUEST);
        }

        $salle->setDisponibilité(false);
        $em->flush();

        return $this->json([
            'message' => 'Salle désactivée avec succès!'
        ], Response::HTTP_OK);
    }

    #[Route('/getAllRoomsAdmin', name: 'getAllRoomsAdmin', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function getAllAdmin(SalleRepository $salleRepository): JsonResponse
    {
        $salles = $salleRepository->findAll();



        $data = [];
        foreach ($salles as $salle) {
            $data[] = [
                'id' => $salle->getId(),
                'nom' => $salle->getNom(),
                'capacite' => $salle->getCapacite(),
                'description' => $salle->getDescription(),
                'localisation' => $salle->getLocalisation(),
                'equipements' => $salle->getEquipements(),
                'disponibilité' => $salle->isDisponibilité()
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }


    #[Route('/restore/{id}', name: 'restore', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. ')]

    public function restore(?Salle $salle, EntityManagerInterface $em): JsonResponse
    {
        if (!$salle) {
            return $this->json(['error' => 'Salle non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($salle->isDisponibilité()) {
            return $this->json(['message' => 'Cette salle est déjà active.'], Response::HTTP_BAD_REQUEST);
        }

        $salle->setDisponibilité(true);
        $em->flush();

        return $this->json([
            'message' => 'Salle désactivée avec succès!'
        ], Response::HTTP_OK);
    }
}
