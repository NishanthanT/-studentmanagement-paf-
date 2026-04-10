package com.smartcampus.hub.repository;

import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserEmail(String email);

    List<Booking> findByUserIdOrderByDateDesc(Long id);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId")
    List<Booking> findByResource(@Param("resourceId") Long resourceId);

    List<Booking> findByDate(LocalDate date);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:resourceId IS NULL OR b.resource.id = :resourceId) AND " +
           "(:date IS NULL OR b.date = :date) AND " +
           "(:userEmail IS NULL OR b.user.email LIKE %:userEmail%) AND " +
           "(:userName IS NULL OR b.user.fullName LIKE %:userName%)")
    List<Booking> filterBookings(
            @Param("status") BookingStatus status,
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("userEmail") String userEmail,
            @Param("userName") String userName
    );

    @Query("SELECT b FROM Booking b WHERE " +
           "b.user.fullName LIKE %:query% OR " +
           "b.user.email LIKE %:query% OR " +
           "b.resource.name LIKE %:query% OR " +
           "b.purpose LIKE %:query%")
    List<Booking> searchBookings(@Param("query") String query);

    @Query("SELECT COUNT(b) FROM Booking b WHERE " +
           "b.resource.id = :resourceId AND " +
           "b.date = :date AND " +
           "b.status = 'APPROVED' AND " +
           "((b.startTime < :endTime AND b.endTime > :startTime))")
    long countOverlappingApprovedBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> countBookingsByStatus();

    long countByStatus(BookingStatus status);

    @Query("SELECT b.date, COUNT(b) FROM Booking b WHERE b.date >= :startDate GROUP BY b.date ORDER BY b.date ASC")
    List<Object[]> countBookingsByDate(@Param("startDate") LocalDate startDate);
}
