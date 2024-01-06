
const login_field = document.getElementById("login");
const password_field = document.getElementById("password");
const sub_button = document.getElementById("sub");


// sub_button.addEventListener("click", send_form);

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    // Получаем значения логина и пароля из полей ввода
    const username = login_field.value;
    const password = password_field.value;
    
    // Отправляем запрос на бэкенд
    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }) // Отправляем данные в формате JSON
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при запросе на сервер');
      }
      return response.json();
    })
    .then(data => {
      // Обрабатываем ответ от сервера (например, сохраняем токен аутентификации в localStorage)
      //window.alert('Successful registration')
      console.log('Успешная авторизация:', data);
      // Здесь можно выполнить перенаправление пользователя на другую страницу и т.д.
    })
    .catch(error => {
      console.error('Ошибка:', error);
      // Обработка ошибок при авторизации
    });


  });
  


