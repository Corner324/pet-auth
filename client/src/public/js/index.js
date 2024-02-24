
const login_field = document.getElementById("login");
const password_field = document.getElementById("password");
const sub_button = document.getElementById("sub");
const foot = document.getElementById("foot");

foot.innerHTML += document.cookie.split(' ')[1];


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
      return response.json();
    })
    .then(data => {
      if (data.redirectURL) {
        window.location.href = data.redirectURL;
      }
      else{
        console.log('Успешная авторизация:', data);
      }

    })
    .catch(error => {
      console.log('Внимание ошибка:', error);
      // Обработка ошибок при авторизации
    });


  });