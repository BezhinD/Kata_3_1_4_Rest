const url = '/api/admin'; // Базовый URL API для администрирования пользователей

// Асинхронная функция для получения списка ролей
async function getRoles() {
    return await fetch("/api/admin/roles") // Отправляем GET-запрос для получения ролей
        .then(response => response.json()); // Преобразуем ответ в JSON
}

// Функция для заполнения выпадающих списков ролями
function listRoles() {
    let tmp = ''; // Переменная для хранения HTML кода ролей
    getRoles().then(roles =>
        roles.forEach(role => {
            tmp += `<option value="${role.id}">${role.name.substring(5)}</option>`; // Формируем <option> для каждой роли
        })
    ).then(r => {
        console.log('listRoles');
        // После формирования списка ролей, вставляем их в элементы
        document.getElementById('editRole').innerHTML = tmp;
        document.getElementById('deleteRole').innerHTML = tmp;
        document.getElementById('role_select').innerHTML = tmp;
    });
}

// Запускаем начальное заполнение списков ролями
listRoles();

// Получение данных всех пользователей
function getUserData() {
    fetch(url) // Отправляем GET-запрос для получения списка пользователей
        .then(res => res.json()) // Преобразуем ответ в JSON
        .then(data => {
            loadTable(data); // Вызываем функцию для отображения данных в таблице
        });
}

// Получение и отображение списка всех пользователей
function getAllUsers() {
    fetch(url).then(response => response.json()).then(user =>
        loadTable(user)); // Аналогично getUserData
}

// Отображение данных в таблице
function loadTable(listAllUsers) {
    let res = ""; // Переменная для хранения HTML таблицы
    for (let user of listAllUsers) {
        res +=
            `<tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.surname}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.roles ? user.roles.map(role => role.name.substring(5)).join(', ') : 'No roles'}</td>
                <td>
                    <button class="btn btn-primary" type="button"
                    data-bs-toggle="modal" data-bs-target="#editModal"
                    onclick="editModal(${user.id})">Edit</button></td>
                <td>
                    <button class="btn btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#deleteModal"
                    onclick="deleteModal(${user.id})">Delete</button></td>
            </tr>`; // Формируем строки таблицы с кнопками редактирования и удаления
    }
    document.getElementById('tableBodyAdmin').innerHTML = res; // Вставляем строки в тело таблицы
}

// Загружаем всех пользователей при загрузке страницы
getAllUsers();

// Добавление нового пользователя
document.getElementById('newUserForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы при отправке формы
    let role = document.getElementById('role_select'); // Получаем выбранные роли
    let rolesAddUser = [];
    for (let i = 0; i < role.options.length; i++) {
        if (role.options[i].selected) {
            rolesAddUser.push({id: role.options[i].value, role: 'ROLE_' + role.options[i].innerHTML});
        }
    }
    fetch(url + '/users', {
        method: 'POST', // Метод POST для создания нового пользователя
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            username: document.getElementById('newName').value,
            surname: document.getElementById('newSurname').value,
            age: document.getElementById('newAge').value,
            email: document.getElementById('newEmail').value,
            password: document.getElementById('newPassword').value,
            roles: rolesAddUser
        })
    }).then((response) => {
        if (response.ok) { // Если запрос успешный
            getUserData(); // Обновляем таблицу
            document.getElementById("show-users-table").click(); // Переходим на вкладку с таблицей пользователей
        }
    });
});

// Открытие модального окна редактирования
function editModal(id) {
    fetch(url + '/users/' + id, { // Получаем данные пользователя по ID
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        }
    }).then(res => {
        res.json().then(async u => {
            document.getElementById('editId').value = u.id;
            document.getElementById('editNameU').value = u.username;
            document.getElementById('editSurname').value = u.surname;
            document.getElementById('editAge').value = u.age;
            document.getElementById('editEmail').value = u.email;
            document.getElementById('editPassword').value = u.password; // Заполняем поля формы
            const allRoles = await getRoles(); // Получаем все роли
            const rolesSelect = document.getElementById('editRole');
            rolesSelect.innerHTML = ''; // Очищаем список ролей
            allRoles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.name.substring(5);
                option.selected = u.roles && u.roles.some(userRole => userRole.id === role.id); // Отмечаем роли пользователя
                rolesSelect.appendChild(option);
            });
        });
    });
}

// Изменение данных пользователя
async function editUser() {
    const rolesSelect = document.getElementById('editRole');
    let idValue = document.getElementById("editId").value;
    let nameValue = document.getElementById('editNameU').value;
    let surnameValue = document.getElementById('editSurname').value;
    let ageValue = document.getElementById('editAge').value;
    let emailValue = document.getElementById('editEmail').value;
    let passwordValue = document.getElementById("editPassword").value;
    let listOfRole = [];
    for (let i = 0; i < rolesSelect.options.length; i++) {
        if (rolesSelect.options[i].selected) {
            listOfRole.push({id: rolesSelect.options[i].value});
        }
    }
    let user = {
        id: idValue,
        username: nameValue,
        surname: surnameValue,
        age: ageValue,
        email: emailValue,
        password: passwordValue,
        roles: listOfRole
    };
    await fetch(url + '/users/' + user.id, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(user)
    });
    closeModal(); // Закрываем модальное окно
    getUserData(); // Обновляем таблицу
}

// Удаление пользователя
function deleteModal(id) {
    fetch(url + '/users/' + id).then(res =>
        res.json().then(u => {
            document.getElementById('deleteId').value = u.id;
            document.getElementById('deleteNameU').value = u.username;
            document.getElementById('deleteSurname').value = u.surname;
            document.getElementById('deleteAge').value = u.age;
            document.getElementById('deleteEmail').value = u.email;
            document.getElementById('deletePassword').value = u.password;
            const rolesContainer = document.getElementById('deleteRole');
            rolesContainer.innerHTML = '';
            u.roles.forEach(role => {
                const option = document.createElement('option');
                option.textContent = role.name.substring(5);
                rolesContainer.appendChild(option);
            });
        }));
}

// Удаление пользователя после подтверждения
async function deleteUser() {
    const id = document.getElementById("deleteId").value;
    let urlDel = url + "/users/" + id;
    let method = {method: 'DELETE', headers: {"Content-Type": "application/json"}};
    fetch(urlDel, method).then(() => {
        closeModal();
        getUserData(); // Обновляем таблицу
    });
}

// Закрытие всех модальных окон
function closeModal() {
    document.querySelectorAll(".btn-close").forEach((btn) => btn.click());
}

// Получение текущего пользователя
function getCurrentUser() {
    fetch('/api/user')
        .then(res => res.json())
        .then(user => {
            document.getElementById('usernamePlaceholder').textContent = user.username;
            document.getElementById('userRoles').textContent = user.roles
                ? user.roles.map(role => role.name.substring(5)).join(', ')
                : 'No roles';
        });
}

// Вызываем функцию для получения текущего пользователя
getCurrentUser();

document.getElementById('show-new-user-form').addEventListener('click', function (event) {
    event.preventDefault();

    // Сброс полей формы
    document.getElementById('newUserForm').reset();

    // Переключение вкладки
    var tab = new bootstrap.Tab(this);
    tab.show();
});