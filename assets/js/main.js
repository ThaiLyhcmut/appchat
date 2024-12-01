import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded,get,child,remove,onChildRemoved } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'
import {FileUploadWithPreview}  from 'https://cdn.jsdelivr.net/npm/file-upload-with-preview/dist/file-upload-with-preview.min.js';

const firebaseConfig = {
  apiKey: "AIzaSyDIZSPIGph3qvbkCJJ6zZsU6rHGUL2EvoE",
  authDomain: "chat-web-5cf56.firebaseapp.com",
  databaseURL: "https://chat-web-5cf56-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-web-5cf56",
  storageBucket: "chat-web-5cf56.appspot.com",
  messagingSenderId: "276551889445",
  appId: "1:276551889445:web:14186da78c37c8cc6105cc",
  measurementId: "G-MCW58XP9QF"
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

  const upload = new FileUploadWithPreview('upload-images',{
    multiple: true,
    maxFileCount: 6
  });
  console.log(upload);


  formChat.addEventListener("submit",async event => {
    event.preventDefault();
    const images = upload.cachedFileArray;
    const content = event.target.content.value;
    event.target.content.value = "";
    const userID = auth.currentUser.uid

    const url = 'https://api.cloudinary.com/v1_1/dkpirk5rl/image/upload';
    const formData = new FormData();
    const imagesCloud = []

    for(let i = 0;i < images.length;i++){
      let file = images[i];
      formData.append('file', file);
      formData.append('upload_preset', 'kuwtouz0');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      imagesCloud.push(data.url)

    }
    console.log(imagesCloud)


    if((content || imagesCloud.length) && userID){
      set(push(ref(db,"chats")),{
        content: content,
        userID: userID,
        images: imagesCloud.length == 0?"":imagesCloud
      })
      upload.resetPreviewPanel();
    }
  })
}


// xoa tin nhan

const buttonDeletechats = (key) => {
  const buttonDelete = document.querySelector(`[button-delete="${key}"]`) // lấy tin nhắn có key đó ra
  buttonDelete.addEventListener("click",() => { // sự kiện click vào tin nhắn đó
    remove(ref(db,"chats/" + key)) // xóa database trên
  })
}


// lay danh sach tin nhan
const bodyChat = document.querySelector(".chat .inner-body");
if(bodyChat){
  // lắng nghe sự kiện thêm database
  onChildAdded(ref(db,"chats"),dataChat => {
    const key = dataChat.key;
    const userID = dataChat.val().userID;
    const content = dataChat.val().content;
    const imagesCloud = dataChat.val().images;
    // lấy database
    get(child(ref(db),"users/" + userID)).then(data => {
      const meID = auth.currentUser.uid
      const fullName = data.val().fullName;
      // thêm database vào giao diện
      const elementChat = document.createElement("div"); // tạo thẻ div
      const listImg = []

      for(let i = 0;i < imagesCloud.length ;i++){
        listImg.push(`<div class="inner-img"> <img src=${imagesCloud[i]}\> </div>`)
      }
      const strContent = []
      if(content != ""){
        strContent.push(`<div class="inner-content">${content}</div>`)
      }
      elementChat.setAttribute("chat-key",key) // thêm atribute vào thẻ vừa tạo
      if(meID != userID){
        elementChat.classList.add("inner-incoming")
        elementChat.innerHTML=`
          <div class="inner-name">
            ${fullName}
          </div>
          ${listImg.join("")}
          ${strContent.join("")}
        `
      }
      else {
        elementChat.classList.add("inner-outgoing")
        elementChat.innerHTML=`
          ${listImg.join("")}
          ${strContent.join("")}
          <button class="button-delete" button-delete=${key}>
            <i class="fa-solid fa-trash-can"></i>
          </button>
        `
      }
      bodyChat.appendChild(elementChat);

      if(meID == userID) buttonDeletechats(key) // xóa trong database có key trên
    });
    
  })
  // lắng nghe sự kiện xóa database 
  onChildRemoved(ref(db,"chats"),dataChat => {
    const key = dataChat.key;
    const elementDelete = document.querySelector(`[chat-key="${key}"]`) // lấy ra thẻ vừa có database bị xóa
    bodyChat.removeChild(elementDelete); // xóa thẻ đó
  })
}


const emojiPicker = document.querySelector('emoji-picker')
if(emojiPicker){
  const inputChat = document.querySelector(".chat .inner-form input[name='content']");

  emojiPicker.addEventListener("emoji-click",event => {
    inputChat.value += event.detail.unicode;
  })
}

// Hien thi tooltip

const ButtonIcon = document.querySelector(".button-icon")
if(ButtonIcon){
  const tooltip = document.querySelector(".tooltip");
  Popper.createPopper(ButtonIcon,tooltip);
  ButtonIcon.addEventListener("click",() => {
    tooltip.classList.toggle("shown");
  })
}

