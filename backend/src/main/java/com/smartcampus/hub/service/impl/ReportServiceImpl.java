package com.smartcampus.hub.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.smartcampus.hub.entity.Booking;
import com.smartcampus.hub.entity.Ticket;
import com.smartcampus.hub.entity.User;
import com.smartcampus.hub.enums.AccountStatus;
import com.smartcampus.hub.enums.BookingStatus;
import com.smartcampus.hub.enums.Role;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.smartcampus.hub.enums.TicketPriority;
import com.smartcampus.hub.enums.TicketStatus;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    @Override
    public byte[] exportUsersToPdf(String searchTerm, Role role, AccountStatus status) {
        List<User> users = userRepository.searchUsers(searchTerm, role, status);
        return generatePdf("User Directory Audit Report", new String[]{"ID", "Name", "Email", "Role", "Status"}, (table) -> {
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA);
            rowFont.setSize(10);
            for (User u : users) {
                table.addCell(new Phrase(String.valueOf(u.getId()), rowFont));
                table.addCell(new Phrase(u.getFullName(), rowFont));
                table.addCell(new Phrase(u.getEmail(), rowFont));
                table.addCell(new Phrase(u.getRole().name(), rowFont));
                table.addCell(new Phrase(u.getStatus().name(), rowFont));
            }
        });
    }

    @Override
    public byte[] exportBookingsToPdf(BookingStatus status, Long resourceId, LocalDate date, String userEmail, String userName) {
        List<Booking> bookings = bookingRepository.filterBookings(status, resourceId, date, userEmail, userName);
        return generatePdf("Campus Booking Operations Report", new String[]{"ID", "Resource", "User", "Date", "Time", "Status"}, (table) -> {
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA);
            rowFont.setSize(10);
            for (Booking b : bookings) {
                table.addCell(new Phrase(String.valueOf(b.getId()), rowFont));
                table.addCell(new Phrase(b.getResource().getName(), rowFont));
                table.addCell(new Phrase(b.getUser().getFullName(), rowFont));
                table.addCell(new Phrase(b.getDate().toString(), rowFont));
                table.addCell(new Phrase(b.getStartTime() + " - " + b.getEndTime(), rowFont));
                table.addCell(new Phrase(b.getStatus().name(), rowFont));
            }
        });
    }

    @Override
    public byte[] exportTicketsToPdf(TicketStatus status, TicketPriority priority, Long technicianId, String userEmail, String userName, String category, Long resourceId, LocalDate date) {
        List<Ticket> tickets = ticketRepository.filterTickets(status, priority, technicianId, userEmail, userName, category, resourceId, date);
        return generatePdf("Maintenance Ticket Audit Report", new String[]{"ID", "Category", "User", "Technician", "Priority", "Status"}, (table) -> {
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA);
            rowFont.setSize(10);
            for (Ticket t : tickets) {
                table.addCell(new Phrase(String.valueOf(t.getId()), rowFont));
                table.addCell(new Phrase(t.getCategory(), rowFont));
                table.addCell(new Phrase(t.getUser().getFullName(), rowFont));
                table.addCell(new Phrase(t.getTechnician() != null ? t.getTechnician().getFullName() : "Unassigned", rowFont));
                table.addCell(new Phrase(t.getPriority().name(), rowFont));
                table.addCell(new Phrase(t.getStatus().name(), rowFont));
            }
        });
    }

    private byte[] generatePdf(String titleText, String[] headers, TableDataConsumer consumer) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph(titleText, fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(headers.length);
            table.setWidthPercentage(100f);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell();
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setPadding(6);
                Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
                font.setColor(Color.WHITE);
                cell.setPhrase(new Phrase(header, font));
                table.addCell(cell);
            }

            consumer.accept(table);

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }
    }

    @FunctionalInterface
    private interface TableDataConsumer {
        void accept(PdfPTable table) throws Exception;
    }
}
