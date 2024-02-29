
const login_field = document.getElementById("login");
const password_field = document.getElementById("password");
const sub_button = document.getElementById("sub");
const foot = document.getElementById("foot");

foot.innerHTML += document.cookie.split(' ')[1];


// sub_button.addEventListener("click", send_form);

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    

    const username = login_field.value;
    const password = password_field.value;
    

    fetch('/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }) 
    })
    .then(response => {
      if (response.redirected) {
        console.log("Redirected!")
        window.location.href = "/";
      }
      else if (!response.ok) {
        response.json().then(dat => {
            console.error("Ошибка: ", dat);
        })
      }
      else{
        return response.json();
      }
    })
    .then(data => {
      console.log(data);
    })
    // .catch(error => {
    //   console.log(error)
    // })
  });
  


