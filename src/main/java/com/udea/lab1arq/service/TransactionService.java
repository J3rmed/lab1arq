package com.udea.lab1arq.service;

import com.udea.lab1arq.DTO.TransactionDTO;
import com.udea.lab1arq.entity.Customer;
import com.udea.lab1arq.entity.Transaction;
import com.udea.lab1arq.repository.CustomerRepository;
import com.udea.lab1arq.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CustomerRepository customerRepository; // Para validar cuentas

    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TransactionDTO getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "La transacción no existe."));
    }

    @Transactional
    public TransactionDTO transferMoney(TransactionDTO transactionDTO) {
        validateTransaction(transactionDTO);

        // Buscar los clientes por número de cuenta
        Customer sender = customerRepository.findByAccountNumber(transactionDTO.getSenderAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("La cuenta del remitente no existe."));
        Customer receiver = customerRepository.findByAccountNumber(transactionDTO.getReceiverAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("La cuenta del receptor no existe."));
//    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        // Validar que el remitente tenga saldo suficiente
        if (sender.getBalance() < transactionDTO.getAmount()) {
            throw new IllegalArgumentException("Saldo insuficiente en la cuenta del remitente.");
            //throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        // Realizar la transferencia
        sender.setBalance(sender.getBalance() - transactionDTO.getAmount());
        receiver.setBalance(receiver.getBalance() + transactionDTO.getAmount());

        // Guardar los cambios en las cuentas
        customerRepository.save(sender);
        customerRepository.save(receiver);


        // Crear y guardar la transacción
        Transaction transaction = new Transaction();
        transaction.setSenderAccountNumber(sender.getAccountNumber());
        transaction.setReceiverAccountNumber(receiver.getAccountNumber());
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setTimestamp(transactionDTO.getTimestamp() != null
                ? transactionDTO.getTimestamp() : LocalDateTime.now());

        transaction = transactionRepository.save(transaction);

        return toDTO(transaction);
    }

    @Transactional
    public TransactionDTO updateTransaction(Long id, TransactionDTO transactionDTO) {
        validateTransaction(transactionDTO);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "La transacción no existe."));

        Customer oldSender = findCustomer(transaction.getSenderAccountNumber(),
                "La cuenta del remitente original no existe.");
        Customer oldReceiver = findCustomer(transaction.getReceiverAccountNumber(),
                "La cuenta del receptor original no existe.");

        // Revertir el movimiento anterior antes de aplicar el nuevo.
        oldSender.setBalance(oldSender.getBalance() + transaction.getAmount());
        oldReceiver.setBalance(oldReceiver.getBalance() - transaction.getAmount());

        Customer newSender = findCustomer(transactionDTO.getSenderAccountNumber(),
                "La cuenta del remitente no existe.");
        Customer newReceiver = findCustomer(transactionDTO.getReceiverAccountNumber(),
                "La cuenta del receptor no existe.");

        if (newSender.getBalance() < transactionDTO.getAmount()) {
            throw new IllegalArgumentException("Saldo insuficiente en la cuenta del remitente.");
        }

        newSender.setBalance(newSender.getBalance() - transactionDTO.getAmount());
        newReceiver.setBalance(newReceiver.getBalance() + transactionDTO.getAmount());
        customerRepository.save(oldSender);
        customerRepository.save(oldReceiver);
        customerRepository.save(newSender);
        customerRepository.save(newReceiver);

        transaction.setSenderAccountNumber(newSender.getAccountNumber());
        transaction.setReceiverAccountNumber(newReceiver.getAccountNumber());
        transaction.setAmount(transactionDTO.getAmount());
        if (transactionDTO.getTimestamp() != null) {
            transaction.setTimestamp(transactionDTO.getTimestamp());
        }

        return toDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "La transacción no existe."));

        Customer sender = findCustomer(transaction.getSenderAccountNumber(),
                "La cuenta del remitente no existe.");
        Customer receiver = findCustomer(transaction.getReceiverAccountNumber(),
                "La cuenta del receptor no existe.");

        sender.setBalance(sender.getBalance() + transaction.getAmount());
        receiver.setBalance(receiver.getBalance() - transaction.getAmount());
        customerRepository.save(sender);
        customerRepository.save(receiver);
        transactionRepository.delete(transaction);
    }

    public List<TransactionDTO> getTransactionsForAccount(String accountNumber) {
        List<Transaction> transactions = transactionRepository.findBySenderAccountNumberOrReceiverAccountNumber(accountNumber, accountNumber);
        return transactions.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private void validateTransaction(TransactionDTO transactionDTO) {
        if (transactionDTO == null
                || transactionDTO.getSenderAccountNumber() == null
                || transactionDTO.getReceiverAccountNumber() == null) {
            throw new IllegalArgumentException("Los números de cuenta del remitente y receptor son obligatorios.");
        }
        if (transactionDTO.getAmount() == null || transactionDTO.getAmount() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor que cero.");
        }
    }

    private Customer findCustomer(String accountNumber, String errorMessage) {
        return customerRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException(errorMessage));
    }

    private TransactionDTO toDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getSenderAccountNumber(),
                transaction.getReceiverAccountNumber(),
                transaction.getAmount(),
                transaction.getTimestamp());
    }
}
