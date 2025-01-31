package ru.kata.spring.boot_security.demo.init_postconstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;

import javax.annotation.PostConstruct;
import java.util.HashSet;
import java.util.Set;

@Component
public class InitializationTable {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public InitializationTable(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    User admin = new User("admin", "admin", 32, "$2a$12$PpxKcTTDZs2rRxvIuYyuY.Qdu3aor/wZhBW38qwPStSDwIQ42OfnS", "admin@mail.ru");
    User user = new User("user", "user", 32, "$2a$12$PpxKcTTDZs2rRxvIuYyuY.Qdu3aor/wZhBW38qwPStSDwIQ42OfnS", "user@mail.ru");

    Role roleAdmin = new Role("ROLE_ADMIN");
    Role roleUser = new Role("ROLE_USER");
    Set<Role> setAdmin = new HashSet<>();
    Set<Role> setUser = new HashSet<>();


    @PostConstruct
    public void initializationTable() {
        roleRepository.save(roleAdmin);
        roleRepository.save(roleUser);

        setAdmin.add(roleAdmin);
        admin.setRoles(setAdmin);
        userRepository.save(admin);

        setUser.add(roleUser);
        user.setRoles(setUser);
        userRepository.save(user);
    }
}