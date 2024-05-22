import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded,get,child } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIZSPIGph3qvbkCJJ6zZsU6rHGUL2EvoE",
  authDomain: "chat-web-5cf56.firebaseapp.com",
  projectId: "chat-web-5cf56",
  storageBucket: "chat-web-5cf56.appspot.com",
  messagingSenderId: "276551889445",
  appId: "1:276551889445:web:14186da78c37c8cc6105cc",
  measurementId: "G-MCW58XP9QF",
  databaseURL: "https://chat-web-5cf56-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase();
// Tinh nang dang ky
const formRegister = document.querySelector("#form-register");
if(formRegister){
  formRegister.addEventListener("submit",event => {
    event.preventDefault();
    const fullName = event.target.fullName.value;
    const email = event.target.email.value;
    const password = event.target.password.value
    // Dang ky tai khoan
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const id = user.uid
        // luu du lieu vao database
        set(ref(db, "users/" + id),{
          fullName: fullName,
        }).then(() => {
          // sau khi lam tat ca thi mo trang chu
          window.location.href = "index.html";
        })
      })
      .catch((error) => {
        console.log(error);
      });
  })
}

// Tinh nang dang nhap
const formLogin = document.querySelector("#form-login");
if(formLogin){
  formLogin.addEventListener("submit",(event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    signInWithEmailAndPassword(auth,email,password)
      .then(userCredential => {
        const user = userCredential.user;
        if(user){
          window.location.href = "index.html";
        } 
      })
      .catch(error => console.log(error));
  })
}

// Tinh nang dang xuat
const buttonLogout = document.querySelector("[button-logout]")

if(buttonLogout){
  buttonLogout.addEventListener("click",() => {
    signOut(auth)
      .then(() => {
        window.location.href = "login.html"
      })
      .catch(error => console.log(error))
  })
}



// Kiem tra da dang nhap hay chua

const chat = document.querySelector(".chat")
const buttonLogin = document.querySelector("[button-login]")
const buttonRegister = document.querySelector("[button-register]")
onAuthStateChanged(auth, user => {
  if(user){
    const uid = user.uid;
    chat.style.display = "block"
    buttonLogout.style.display = "inline-block"
  }else{
    buttonLogin.style.display = "inline-block"
    window.localStorage.clear();
    buttonRegister.style.display = "inline-block"
    if(chat){
      chat.innerHTML = ""
    }
  }
})


// Chat co ban (gui tin nhan van ban)

const formChat = document.querySelector(".chat .inner-form")

if(formChat){
  formChat.addEventListener("submit", event => {
    event.preventDefault();
    const content = event.target.content.value;
    event.target.content.value = "";
    const userID = auth.currentUser.uid
    if(content && userID){
      set(push(ref(db,"chats")),{
        content: content,
        userID: userID
      })
    }
  })
}




// lay danh sach tin nhan
const bodyChat = document.querySelector(".chat .inner-body");
if(bodyChat){
  onChildAdded(ref(db,"chats"),dataChat => {
    const key = dataChat.key;
    const userID = dataChat.val().userID;
    const content = dataChat.val().content;
    get(child(ref(db),"users/" + userID)).then(data => {
      const meID = auth.currentUser.uid
      const fullName = data.val().fullName;
      const elemetChat = document.createElement("div");
      if(meID != userID){
        elemetChat.classList.add("inner-incoming")
        elemetChat.innerHTML=`
          <div class="inner-name">
            ${fullName}
          </div>
          <div class="inner-content">
            ${content}
          </div>
        `
      }
      else {
        elemetChat.classList.add("inner-outgoing")
        elemetChat.innerHTML=`
          <div class="inner-content">
            ${content}
          </div>
        `
      }
      
      bodyChat.appendChild(elemetChat);
    });
    
  })
}
