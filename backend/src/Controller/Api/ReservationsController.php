<?php

namespace App\Controller\Api;

use App\Entity\Reservations;
use App\Repository\ReservationsRepository;
use App\Repository\SalleRepository;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/reservations', name: 'api_reservations_')]
final class ReservationsController extends AbstractController
{
    #[Route('/create', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UtilisateurRepository $userRepo,
        SalleRepository $salleRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['date']) || empty($data['heure_debut']) || empty($data['heure_fin']) || empty($data['utilisateur_id']) || empty($data['salle_id'])) {
            return $this->json(['error' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification des FK
        $user = $userRepo->find($data['utilisateur_id']);
        $salle = $salleRepo->find($data['salle_id']);

        if (!$user || !$salle) {
            return $this->json(['error' => 'Utilisateur ou Salle introuvable'], Response::HTTP_NOT_FOUND);
        }

        //  Conversion en objets DateTime/DateInterval pour PHP
        try {
            $dateResa = new \DateTime($data['date']);
            $debut = new \DateTime($data['heure_debut']);
            $fin = new \DateTime($data['heure_fin']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Format de date ou heure invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if ($fin <= $debut) {
            return $this->json(['error' => 'L\'heure de fin ne peut pas être inférieure ou égale à l\'heure de début.'], Response::HTTP_BAD_REQUEST);
        }

        $reservation = new Reservations();
        $reservation->setDate($dateResa);
        $reservation->setHeureDebut($debut);
        $reservation->setHeureFin($fin);
        $reservation->setUtilisateur($user);
        $reservation->setSalle($salle);


        $em->persist($reservation);
        $em->flush();

        return $this->json([
            'message' => 'Réservation créée avec succès !',
            'id' => $reservation->getId(),
            'statut' => $reservation->getStatut()
        ], Response::HTTP_CREATED);
    }


    #[Route('/getAllResa', name: 'getAllResa', methods: ['GET'])]
    public function getAll(ReservationsRepository $reservationsRepository): JsonResponse
    {
        // [] = Pas de filtre (on prend tout)
        // ['dateCreation' => 'DESC'] = Tri par date_creation de la plus récente à la plus ancienne
        $reservations = $reservationsRepository->findBy([], ['dateCreation' => 'DESC']);

        $data = [];
        foreach ($reservations as $reservation) {
            $data[] = [
                'id' => $reservation->getId(),
                'date' => $reservation->getDate()?->format('d-m-Y'),
                'heure_debut' => $reservation->getHeureDebut()?->format('H:i:s'),
                'heure_fin' => $reservation->getHeureFin()?->format('H:i:s'),
                'statut' => $reservation->getStatut(),
                'date_creation' => $reservation->getDateCreation()?->format('d-m-Y'),
                'utilisateur' => [
                    'id' => $reservation->getUtilisateur()?->getId(),
                    'nom' => $reservation->getUtilisateur()?->getNom(),
                    'prenom' => $reservation->getUtilisateur()?->getPrenom(),
                    'email' => $reservation->getUtilisateur()?->getEmail()

                ],
                'salle' => [
                    'id' => $reservation->getSalle()?->getId(),
                    'nom' => $reservation->getSalle()?->getNom(),
                    'localisation' => $reservation->getSalle()?->getLocalisation()
                ]
            ];
        }
        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/get_one/{id}', name: 'get_one', methods: ['GET'])]
    public function getOne(int $id, ReservationsRepository $reservationsRepository): JsonResponse
    {
        $reservation = $reservationsRepository->find($id);

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $reservation->getId(),
            'date' => $reservation->getDate()?->format('d-m-Y'),
            'heure_debut' => $reservation->getHeureDebut()?->format('H:i:s'),
            'heure_fin' => $reservation->getHeureFin()?->format('H:i:s'),
            'statut' => $reservation->getStatut(),
            'date_creation' => $reservation->getDateCreation()?->format('d-m-Y'),
            'utilisateur' => [
                'id' => $reservation->getUtilisateur()?->getId(),
                'nom' => $reservation->getUtilisateur()?->getNom(),
                'prenom' => $reservation->getUtilisateur()?->getPrenom(),
                'email' => $reservation->getUtilisateur()?->getEmail()
            ],
            'salle' => [
                'id' => $reservation->getSalle()?->getId(),
                'nom' => $reservation->getSalle()?->getNom(),
                'localisation' => $reservation->getSalle()?->getLocalisation()
            ]
        ];

        return $this->json($data, Response::HTTP_OK);
    }


    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    public function update(
        ?Reservations $reservation,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$reservation) {
            return $this->json(['error' => 'Reservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);


        try {
            if (!empty($data['date'])) {
                $reservation->setDate(new \DateTime($data['date']));
            }
            if (!empty($data['heure_debut'])) {
                $reservation->setHeureDebut(new \DateTime($data['heure_debut']));
            }
            if (!empty($data['heure_fin'])) {
                $reservation->setHeureFin(new \DateTime($data['heure_fin']));
            }

        } catch (\Exception $e) {
            return $this->json(['error' => 'Format de date ou heure invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if ($reservation->getHeureFin() <= $reservation->getHeureDebut()) {
            return $this->json(['error' => 'L\'heure de fin ne peut pas être inférieure ou égale à l\'heure de début.'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['statut'])) {
            $reservation->setStatut($data['statut']);
        }


        $em->flush();



        return $this->json([
            'message' => 'Réservation mise à jour avec succès !',
            'Reservation' => [
                'id' => $reservation->getId(),
                'date' => $reservation->getDate()?->format('d-m-Y'),
                'heure_debut' => $reservation->getHeureDebut()?->format('H:i:s'),
                'heure_fin' => $reservation->getHeureFin()?->format('H:i:s'),
                'statut' => $reservation->getStatut(),
                'date_creation' => $reservation->getDateCreation()?->format('d-m-Y'),
                'utilisateur' => [
                    'id' => $reservation->getUtilisateur()?->getId(),
                    'nom' => $reservation->getUtilisateur()?->getNom(),
                    'prenom' => $reservation->getUtilisateur()?->getPrenom(),
                    'email' => $reservation->getUtilisateur()?->getEmail()
                ],
                'salle' => [
                    'id' => $reservation->getSalle()?->getId(),
                    'nom' => $reservation->getSalle()?->getNom(),
                    'localisation' => $reservation->getSalle()?->getLocalisation()
                ]

            ]
        ], Response::HTTP_OK);
    }

     #[Route('/delete/{id}', name: 'delete',methods: ['DELETE'])]
    public function delete(?Reservations $reservation, EntityManagerInterface $em): JsonResponse
    {
        if(!$reservation){
            return $this->json(['error' => 'Reservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($reservation);
        $em->flush();

        return $this->json([
            'message'=>'Réservation supprimée avec succès!'
        ], Response::HTTP_OK);
    }
}
