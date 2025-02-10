package ru.kata.spring.boot_security.demo.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    public UserServiceImpl(UserRepository userRepository, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User " + username + " not found");
        }
        return user.get();
    }


    @Override
    public List<User> getAllUsers() {
        if (userRepository.count() == 0) {
            throw new EntityExistsException("UserRepository is empty");
        }
        return userRepository.findAll();
    }

    @Transactional
    @Override
    public void saveUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new EntityExistsException("User " + user.getUsername() + " already exists");
        }
        userRepository.save(user);

    }

    @Transactional
    @Override
    public User createUser(User user, Set<Role> roles) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Set<Role> setOfRoles = roles.stream().map(role -> {
                    Role foundRole = roleService.findByName(role.getName());
                    if (foundRole == null) {
                        throw new EntityNotFoundException("Role " + role.getName() + " not found");
                    }
                    return foundRole;
                })
                .collect(Collectors.toSet());
        user.setRoles(setOfRoles);
        return user;
    }

    @Override
    public User getOne(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User " + id + " not found");
        }
        return userRepository.findById(id).get();
    }

    @Transactional
    @Override
    public User updateUser(Long id, User userFromRequest, Set<Role> roles) {
        User user = getOne(id);

        user.setUsername(userFromRequest.getUsername());
        user.setSurname(userFromRequest.getSurname());
        user.setAge(userFromRequest.getAge());

        String newPassword = userFromRequest.getPassword();
        if (newPassword != null && !newPassword.isEmpty() && !newPassword.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        user.setEmail(userFromRequest.getEmail());
        user.setRoles(userFromRequest.getRoles());

        if (roles != null && !roles.isEmpty()) {
            user.setRoles(new HashSet<>(roles));
        }

        userRepository.save(user);
        return user;
    }

    @Transactional
    @Override
    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User oneUser(Principal principal) {
        return (User) ((Authentication) principal).getPrincipal();
    }

}
