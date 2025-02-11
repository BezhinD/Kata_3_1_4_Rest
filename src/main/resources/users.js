const url = '/api/admin'; // Базовый URL API для администрирования пользователей

// Асинхронная функция для получения списка ролей
async function getRoles() {
    return fetch("/api/admin/roles")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => console.error('Ошибка при загрузке ролей:', error));
}

// Функция для заполнения выпадающих списков ролями
function listRoles() {
    let tmp = '';
    getRoles().then(roles => {
        roles.forEach(role => {
            tmp += `<option value="${role.id}">${role.name.substring(5)}</option>`;
        });
        if (!document.getElementById('editRole').innerHTML) {
            document.getElementById('editRole').innerHTML = tmp;
            document.getElementById('deleteRole').innerHTML = tmp;
            document.getElementById('role_select').innerHTML = tmp;
        }
    });
}

// Запускаем начальное заполнение списков ролями
listRoles();

// Получение и отображение списка всех пользователей
function getAllUsers() {
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => loadTable(data))
        .catch(error => console.error('Ошибка при загрузке пользователей:', error));
}

// Отображение данных в таблице
function loadTable(listAllUsers) {
    let res = "";
    listAllUsers.forEach(user => {
        res += `
            <tr>
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
            </tr>`;
    });
    document.getElementById('tableBodyAdmin').innerHTML = res;
}

// Загружаем всех пользователей при загрузке страницы
getAllUsers();

// Добавление нового пользователя
document.getElementById('newUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let role = document.getElementById('role_select');
    let rolesAddUser = [];
    for (let i = 0; i < role.options.length; i++) {
        if (role.options[i].selected) {
            rolesAddUser.push({id: role.options[i].value, role: 'ROLE_' + role.options[i].innerHTML});
        }
    }
    fetch(url + '/users', {
        method: 'POST',
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
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }).then(() => {
        getAllUsers();
        document.getElementById('newUserForm').reset();
        document.getElementById("show-users-table").click();
    }).catch(error => console.error('Ошибка при добавлении пользователя:', error));
});

// Открытие модального окна редактирования
function editModal(id) {
    fetch(url + '/users/' + id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        }
    }).then(res => {
        if (!res.ok) {
            throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }
        return res.json();
    }).then(async u => {
        document.getElementById('editId').value = u.id;
        document.getElementById('editNameU').value = u.username;
        document.getElementById('editSurname').value = u.surname;
        document.getElementById('editAge').value = u.age;
        document.getElementById('editEmail').value = u.email;
        document.getElementById('editPassword').value = '';
        const allRoles = await getRoles();
        const rolesSelect = document.getElementById('editRole');
        rolesSelect.innerHTML = '';
        allRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name.substring(5);
            option.selected = u.roles && u.roles.some(userRole => userRole.id === role.id);
            rolesSelect.appendChild(option);
        });
    }).catch(error => console.error('Ошибка при загрузке данных пользователя:', error));
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
    }).then(res => {
        if (!res.ok) {
            throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }
        closeModal();
        getAllUsers();
    }).catch(error => console.error('Ошибка при редактировании пользователя:', error));
}

// Удаление пользователя
function deleteModal(id) {
    fetch(url + '/users/' + id)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(u => {
            document.getElementById('deleteId').value = u.id;
            document.getElementById('deleteNameU').value = u.username;
            document.getElementById('deleteSurname').value = u.surname;
            document.getElementById('deleteAge').value = u.age;
            document.getElementById('deleteEmail').value = u.email;
            document.getElementById('deletePassword').value = '';
            const rolesContainer = document.getElementById('deleteRole');
            rolesContainer.innerHTML = '';
            u.roles.forEach(role => {
                const option = document.createElement('option');
                option.textContent = role.name.substring(5);
                rolesContainer.appendChild(option);
            });
        })
        .catch(error => console.error('Ошибка при загрузке данных пользователя:', error));
}

// Удаление пользователя после подтверждения
async function deleteUser() {
    const id = document.getElementById("deleteId").value;
    let urlDel = url + "/users/" + id;
    let method = {method: 'DELETE', headers: {"Content-Type": "application/json"}};
    fetch(urlDel, method)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
            }
            closeModal();
            getAllUsers();
        })
        .catch(error => console.error('Ошибка при удалении пользователя:', error));
}

// Закрытие всех модальных окон
function closeModal() {
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    if (editModal) editModal.hide();
    if (deleteModal) deleteModal.hide();
}

// Получение текущего пользователя
function getCurrentUser() {
    fetch('/api/user')
        .then(res => {
            if (!res.ok) {
                throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(user => {
            document.getElementById('usernamePlaceholder').textContent = user.username;
            document.getElementById('userRoles').textContent = user.roles
                ? user.roles.map(role => role.name.substring(5)).join(', ')
                : 'No roles';
        })
        .catch(error => console.error('Ошибка при получении текущего пользователя:', error));
}

// Вызываем функцию для получения текущего пользователя
getCurrentUser();

// Обработчик для переключения вкладок
document.getElementById('show-new-user-form').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('newUserForm').reset();
    new bootstrap.Tab(document.querySelector('#show-new-user-form')).show();
});