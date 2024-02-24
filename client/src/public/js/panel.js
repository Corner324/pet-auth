const foot = document.getElementById("foot");

foot.innerHTML += document.cookie.split(' ')[1];

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    // Отправляем запрос на бэкенд
    fetch('/clearCookie', {
      method: 'GET',
      headers: {
        'Cookie': 'cookie_name=UserData; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      },
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.redirectURL) {
        window.location.href = data.redirectURL;
      }
      else{
        console.log('Успешная операция, данные: ', data);
      }

    })
    .catch(error => {
      console.log('Внимание ошибка:', error);
      // Обработка ошибок при авторизации
    });


  });