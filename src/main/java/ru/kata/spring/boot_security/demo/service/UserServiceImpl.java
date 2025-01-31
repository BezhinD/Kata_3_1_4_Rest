package ru.kata.spring.boot_security.demo.service;

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

    @Transactional
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void saveUser(User user) {
        userRepository.save(user);

    }

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
        return userRepository.findById(id).get();
    }

    @Transactional
    @Override
    public void updateUser(Long id, User user) {
        User userToUpdate = userRepository.findById(id).get();
        userToUpdate.setUsername(user.getUsername());
        userToUpdate.setSurname(user.getSurname());
        userToUpdate.setAge(user.getAge());
        userToUpdate.setPassword(user.getPassword());
        userToUpdate.setEmail(user.getEmail());
        userToUpdate.setRoles(user.getRoles());
        userRepository.save(userToUpdate);
    }

    @Transactional
    @Override
    public User updateUser(Long id, User userFromRequest, Set<Role> roles) {
        User userToUpdate = getOne(id);
        String newPassword = userFromRequest.getPassword();
        if (newPassword != null && !newPassword.isEmpty() && !newPassword.equals(userFromRequest.getPassword())) {
            userFromRequest.setPassword(passwordEncoder.encode(newPassword));

        } else {
            userFromRequest.setPassword(userToUpdate.getPassword());
        }
        if (roles != null || roles.isEmpty()) {
            userFromRequest.setRoles(userToUpdate.getRoles());
        } else {
            userFromRequest.setRoles(new HashSet<>(roles));
        }
        return userFromRequest;
    }

    @Override
    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User oneUser(Principal principal) {
        return (User) ((Authentication) principal).getPrincipal();
    }

    @Transactional
    public Role getRole(String role) {
        return roleService.findByName(role);
    }
}
