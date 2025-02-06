package ru.kata.spring.boot_security.demo.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.Set;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {

        this.userService = userService;
    }

    @GetMapping()
    public String getUsers(Model model) {
        model.addAttribute("users", userService.getAllUsers());
        return "users";
    }

    @GetMapping("/new/")
    public String newUser(Model model) {
        model.addAttribute("user", new User());
        return "new";
    }

    @PostMapping("/edit")
    public String edit(@RequestParam(value = "id") long id, Model model) {
        model.addAttribute("user", userService.getOne(id));
        return "adminInfo";
    }

    @PostMapping("/new/")
    public String addUser(@ModelAttribute User user, @RequestParam(value = "role") Set<Role> roles) {
        userService.saveUser(userService.createUser(user, roles));
        return "redirect:/admin/";
    }

    @PostMapping("/update")
    public String update(@ModelAttribute("user") User user,
                         @RequestParam(value = "role", required = false) Set<Role> roleNames,
                         @RequestParam(value = "id") long id) {
        userService.updateUser(id, user, roleNames);
        return "redirect:/admin/";
    }

    @PostMapping("/delete/")
    public String delete(@RequestParam("id") long id) {
        userService.delete(id);
        return "redirect:/admin/";
    }
}
