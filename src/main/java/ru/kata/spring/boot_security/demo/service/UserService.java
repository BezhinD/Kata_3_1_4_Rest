package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;

import java.security.Principal;
import java.util.List;
import java.util.Set;

public interface UserService {
    List<User> getAllUsers();

    void saveUser(User user);

    User createUser(User user, Set<Role> roles);

    User getOne(Long id);



    void updateUser(Long id, User userFromRequest, Set<Role> roles);

    void delete(Long id);

    User oneUser(Principal principal);
}
