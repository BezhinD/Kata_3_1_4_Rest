const apiUrl = '/api/user';

/**
 * Отображение данных пользователя на странице
 */
function displayUserData(user) {
    document.getElementById('usernamePlaceholder').textContent = user.username || 'N/A';
    document.getElementById('userRoles').textContent = user.roles
        ? user.roles.map(role => role.name.startsWith('ROLE_') ? role.name.substring(5) : role.name).join(', ')
        : 'No roles';

    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = `
        <tr>
            <td>${user.id || 'N/A'}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.surname || 'N/A'}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.roles ? user.roles.map(role => role.name.startsWith('ROLE_') ? role.name.substring(5) : role.name).join(', ') : 'No roles'}</td>
        </tr>
    `;
}

/**
 * Получение данных текущего пользователя из API
 */
async function fetchCurrentUser() {
    try {
        // Показываем индикатор загрузки
        document.getElementById('userTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Загрузка данных...</td>
            </tr>
        `;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();
        displayUserData(user);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        document.getElementById('usernamePlaceholder').textContent = 'Ошибка загрузки данных';
        document.getElementById('userRoles').textContent = '';
        document.getElementById('userTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-danger">Ошибка загрузки данных пользователя</td>
            </tr>
        `;
    }
}

// Загрузка данных пользователя при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchCurrentUser);