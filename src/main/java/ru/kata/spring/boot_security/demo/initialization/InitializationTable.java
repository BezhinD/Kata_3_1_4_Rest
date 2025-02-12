package ru.kata.spring.boot_security.demo.initialization;

import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;

import javax.annotation.PostConstruct;
import java.util.Set;

@Component
public class InitializationTable {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    public InitializationTable(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @PostConstruct
    public void initializationTable() {

        User admin = new User("admin",
                "admin",
                32,
                "$2a$12$PpxKcTTDZs2rRxvIuYyuY.Qdu3aor/wZhBW38qwPStSDwIQ42OfnS",
                "admin@mail.ru");

        User user = new User("user",
                "user",
                32,
                "$2a$12$PpxKcTTDZs2rRxvIuYyuY.Qdu3aor/wZhBW38qwPStSDwIQ42OfnS",
                "user@mail.ru");

        Role roleAdmin = new Role("ROLE_ADMIN");
        Role roleUser = new Role("ROLE_USER");
        roleRepository.save(roleAdmin);
        roleRepository.save(roleUser);
        admin.setRoles(Set.of(roleAdmin));
        userRepository.save(admin);
        user.setRoles(Set.of(roleUser));
        userRepository.save(user);
    }
}