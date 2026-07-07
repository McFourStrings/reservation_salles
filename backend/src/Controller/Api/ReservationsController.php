<?php

namespace App\Controller\Api;

use App\Entity\Reservations;
use App\Enum\ResaStatut;
use App\Repository\ReservationsRepository;
use App\Repository\SalleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reservations', name: 'api_reservations_')]
final class ReservationsController extends AbstractController
{
    #[Route('/create', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Seul un client peut réserver une salle.')]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        SalleRepository $salleRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['date']) || empty($data['heure_debut']) || empty($data['heure_fin']) || empty($data['salle_id'])) {
            return $this->json(['error' => 'Données incomplètes'], Response::HTTP_BAD_REQUEST);
        }

        /** @var \App\Entity\Utilisateur $user */
        $user = $this->getUser();
        $salle = $salleRepo->find($data['salle_id']);

        if (!$user || !$salle) {
            return $this->json(['error' => 'Utilisateur ou Salle introuvable'], Response::HTTP_NOT_FOUND);
        }

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
        // Le statut se mettra par défaut sur STAND_BY si configuré dans ton entité/constructeur

        $em->persist($reservation);
        $em->flush();

        return $this->json([
            'message' => 'Réservation créée avec succès !',
            'id' => $reservation->getId(),
            'statut' => $reservation->getStatut()?->value ?? $reservation->getStatut()
        ], Response::HTTP_CREATED);
    }

    #[Route('/my-reservations', name: 'my_reservations', methods: ['GET'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Connectez-vous pour voir vos réservations.')]
    public function getMyReservations(ReservationsRepository $reservationsRepository): JsonResponse
    {
        /** @var \App\Entity\Utilisateur $currentUser */
        $currentUser = $this->getUser();

        // Récupération des réservations uniquement pour l'utilisateur connecté
        $reservations = $reservationsRepository->findBy(
            ['utilisateur' => $currentUser],
            ['date_creation' => 'DESC']
        );

        $data = [];
        foreach ($reservations as $reservation) {
            $data[] = $this->formatReservation($reservation);
        }

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/getAllResa', name: 'getAllResa', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès réservé aux administrateurs.')]
    public function getAll(ReservationsRepository $reservationsRepository): JsonResponse
    {
        $reservations = $reservationsRepository->findBy([], ['date_creation' => 'DESC']);

        $data = [];
        foreach ($reservations as $reservation) {
            $data[] = $this->formatReservation($reservation);
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

        return $this->json($this->formatReservation($reservation), Response::HTTP_OK);
    }

    #[Route('/update/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_CLIENT', message: 'Accès refusé. Seul un client peut modifier une réservation.')]
    public function update(
        ?Reservations $reservation,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Entity\Utilisateur $currentUser */
        $currentUser = $this->getUser();

        if ($reservation->getUtilisateur() !== $currentUser) {
            return $this->json([
                'error' => 'Accès interdit. Vous ne pouvez modifier que vos propres réservations.'
            ], Response::HTTP_FORBIDDEN);
        }

        $statutActuel = $reservation->getStatut();

        if ($statutActuel === ResaStatut::ANNULE || $statutActuel === ResaStatut::CONFIRME) {
            return $this->json([
                'error' => sprintf('Accès interdit. Cette réservation est "%s" et ne peut plus être modifiée.', $statutActuel->value)
            ], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!empty($data['statut'])) {
            $statutDemande = ResaStatut::tryFrom(strtolower($data['statut']));

            if (!$statutDemande) {
                return $this->json(['error' => 'Statut invalide.'], Response::HTTP_BAD_REQUEST);
            }

            if ($statutDemande === ResaStatut::CONFIRME) {
                return $this->json([
                    'error' => 'Action interdite. Seul un administrateur peut confirmer une réservation.'
                ], Response::HTTP_FORBIDDEN);
            }

            if ($statutDemande === ResaStatut::ANNULE && $statutActuel === ResaStatut::STAND_BY) {
                $reservation->setStatut(ResaStatut::ANNULE);
                $statutActuel = ResaStatut::ANNULE;
            }
        }

        if ($statutActuel === ResaStatut::STAND_BY) {
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
        }

        $em->flush();

        return $this->json([
            'message' => 'Réservation traitée avec succès !',
            'Reservation' => $this->formatReservation($reservation)
        ], Response::HTTP_OK);
    }

    #[Route('/delete/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès refusé. Seul un administrateurs peut supprimer une réservation.')]
    public function delete(?Reservations $reservation, EntityManagerInterface $em): JsonResponse
    {
        if (!$reservation) {
            return $this->json(['error' => 'Reservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($reservation);
        $em->flush();

        return $this->json([
            'message' => 'Réservation supprimée avec succès!'
        ], Response::HTTP_OK);
    }

    /**
     * Helper pour centraliser le formatage JSON des réservations et éviter la duplication
     */
    private function formatReservation(Reservations $reservation): array
    {
        return [
            'id' => $reservation->getId(),
            'date' => $reservation->getDate()?->format('d-m-Y'),
            'heure_debut' => $reservation->getHeureDebut()?->format('H:i:s'),
            'heure_fin' => $reservation->getHeureFin()?->format('H:i:s'),
            'statut' => $reservation->getStatut() instanceof ResaStatut ? $reservation->getStatut()->value : $reservation->getStatut(),
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
                'localisation' => $reservation->getSalle()?->getLocalisation(),
                'disponibilité'=>$reservation->getSalle()?->isDisponibilité()
            ]
        ];
    }

    #[Route('/admin/update-status/{id}', name: 'admin_update_status', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN', message: 'Accès réservé aux administrateurs.')]
    public function adminUpdateStatus(
        ?Reservations $reservation,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        if (!$reservation) {
            return $this->json(['error' => 'Réservation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['statut'])) {
            return $this->json(['error' => 'Le champ statut est requis.'], Response::HTTP_BAD_REQUEST);
        }

        // On cherche si la valeur envoyée correspond bien à un de tes Enums
        $newStatus = ResaStatut::tryFrom($data['statut']);

        if (!$newStatus) {
            return $this->json(['error' => 'Statut invalide.'], Response::HTTP_BAD_REQUEST);
        }

        // L'admin a tous les droits : on applique directement le nouveau statut
        $reservation->setStatut($newStatus);
        $em->flush();

        return $this->json([
            'message' => sprintf('Le statut de la réservation %d a été modifié avec succès !', $reservation->getId()),
            'statut' => $reservation->getStatut()->value
        ], Response::HTTP_OK);
    }
}
