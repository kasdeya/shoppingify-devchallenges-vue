<script setup>
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithRedirect, signOut } from 'firebase/auth';
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { useFirebaseAuth, useFirestore } from 'vuefire'
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
const db = useFirestore()
const auth = useFirebaseAuth()
const user = ref()
const signUpEmail = ref('')
const signUpPassword = ref('')
const userId = ref()
const userItems = ref([])
const userShoppingLists = ref([])
const categories = ref(['Fruits and vegetables', 'Meat and fish', 'Beverages'])

// Use watchEffect to create the observer
onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser;
      userId.value = currentUser.uid
      fetchItemList()
      fetchShoppingList()
    } else {
      user.value = null
      userId.value = null
      userItems.value = []
      userShoppingLists.value = []
    }
  })
})

const fetchItemList = async () => {
  const userRef = doc(db, 'itemList', userId.value)
  // const docSnap = await getDoc(userRef)
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    console.log("Document data:", snapshot.data());
    userItems.value = snapshot.data().items
  } else {
    userItems.value = [];
  }
};

const fetchShoppingList = async () => {
  const userRef = doc(db, 'shoppingList', userId.value)

  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) {
    console.log("shopping lists data:", snapshot.data())
    userShoppingLists.value = snapshot.data()
  } else {
    userShoppingLists.value = [];
  }
}




const handleRegistration = () => {
  createUserWithEmailAndPassword(auth, signUpEmail.value, signUpPassword.value)
    .then((userCredential) => {
      // Signed in
      user.value = userCredential.user;
      signUpEmail.value = ''
      signUpPassword.value = ''
      console.log(user)
      // ..
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      // ..
    })
}

const signInEmail = ref('')
const signInPassword = ref('')

const handleSignIn = () => {
  signInWithEmailAndPassword(auth, signInEmail.value, signInPassword.value)
    .then((userCredential) => {
      // Signed in
      user.value = userCredential.user
      signInEmail.value = ''
      signInPassword.value = ''
      console.log(user)
      //
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
    })
}

const handleSignOut = async () => {
  try {
    await signOut(auth)
      .then(() => {
        console.log('signedOut')
        // user.value = null
      })
  } catch (error) {
    console.error('Error signing out:', error.message)
  }
}


const items = ref([
  {
    name: 'tomato',
    note: 'tomatoes are red and delicious',
    image: 'https://i5.walmartimages.com/seo/Slicing-Tomato-Each_9f8b7456-81d0-4dc2-b422-97cf63077762.0ddba51bbf14a5029ce82f5fce878dee.jpeg',
    category: 'Fruits and vegetables',
    quantity: 1
  }
])

const shoppingList = ref([

])

const nameInput = ref('')
const noteInput = ref('')
const imageInput = ref('')
const categoryInput = ref('')

const onSubmit = async () => {
  const newItem = {
    name: nameInput.value,
    note: noteInput.value,
    image: imageInput.value,
    category: categoryInput.value,
    quantity: 1
  }

  items.value.push(newItem)

  // Clear the input fields after submission
  nameInput.value = '';
  noteInput.value = '';
  imageInput.value = '';
  categoryInput.value = '';

  const userRef = collection(db, 'itemList');

  try {
    await setDoc(doc(userRef, userId.value), {
      items: arrayUnion(newItem),
    }, { merge: true });
    console.log('Item added to user list successfully!')
  } catch (error) {
    console.error('Error adding new item:', error);
  }
};

const handleAddItem = (item) => {
  const addedItem = {
    name: item.name,
    note: item.note,
    image: item.image,
    quantity: 1
  };

  shoppingList.value.push(addedItem);
}

const listName = ref('')
const handleAddShoppingList = async () => {

  // shoppingList {
  //  userid {[
  // nameoflist [
  //{item 1}
  //{item 2}
  //{item 3}
  //]
  //]}
  // }

  // userShoppingList {
  // 
  // }

  const userRef = collection(db, 'shoppingList');

  try {
    await setDoc(doc(userRef, userId.value), {
      [listName.value]: shoppingList.value,
    }, { merge: true });
    console.log('Item added to user list successfully!')
  } catch (error) {
    console.error('Error adding new item:', error);
  }
}

const removeItem = (index) => {
  shoppingList.value.splice(index, 1)
}

const groupedItems = computed(() => {
  const grouped = {};
  for ( const item of userItems.value) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item)
  }
  return grouped
})

const getCategoryItems = (category) => {
  return groupedItems.value[category] || [];
}


</script>

<template>
  <header>
    <div class="wrapper">
    </div>
  </header>

  <main>
    <div className="registerFormContainer">
      <form @submit.prevent="handleRegistration">
        <label for="email">
          <input type="email" id="email" name="email" placeholder="email" v-model="signUpEmail">
        </label>
        <label for="password">
          <input type="password" id="pass" name="pass" placeholder="password" v-model="signUpPassword">
        </label>
        <button type="submit">Register</button>
      </form>
    </div>

    <div className="signInFormContainer">
      <form @submit.prevent="handleSignIn">
        <label for="email">
          <input type="email" id="email" name="email" placeholder="john@email.com" v-model="signInEmail">
        </label>
        <label for="password">
          <input type="password" id="pass" name="pass" placeholder="password" v-model="signInPassword">
        </label>
        <button type="submit">Sign In</button>
      </form>
    </div>

    <button @click="handleSignOut">Sign Out</button>
    <p v-if="user">{{ user.email }}</p>

    <div className="formContainer">
      <h2>Add a new item</h2>
      <form @submit.prevent="onSubmit">
        <label for="name" required>Name</label>
        <input type="text" id="name" v-model="nameInput">
        <label for="note">Note (optional)</label>
        <input type="text" id="note" v-model="noteInput">
        <label for="image">Image (optional)</label>
        <input type="text" id="image" v-model="imageInput">

        <select v-model="categoryInput" name="category" id="category" required>
          <option value="" disabled selected hidden>Enter a category</option>
          <option v-for="(category, index) in categories" :key="index" :value="category">{{ category }}</option>
          <!-- <option value="fruitsAndVegetables">Fruits and vegetables</option>
          <option value="meatAndFish">Meat and fish</option>
          <option value="beverages">Beverages</option> -->
        </select>

        <button>cancel</button>
        <button>Save</button>
      </form>
    </div>

    <div className="itemsContainer">
      <div v-for="(item, index) in items" :key="index" className="item">
        <p>{{ item.name }}</p>
        <button @click="handleAddItem(item)">+</button>
      </div>
    </div>

    <div className="shoppingListContainer">
      <div v-for="(item, index) in shoppingList" :key="index" className="shoppingListItem">
        <p>{{ item.name }}</p>
        <div className="piecesContainer">
          <button @click="removeItem(index)">trash</button>
          <button @click="item.quantity++">+</button>
          <p>{{ item.quantity }} pcs</p>
          <button @click="item.quantity--">-</button>
        </div>
      </div>
      <label for="listName">List name</label>
      <input type="text" required v-model="listName">
      <button @click="handleAddShoppingList">add list</button>
    </div>


    <div v-if="userItems">
      <p v-for="(item, index) in userItems" :key="index">
        {{ item }}
      </p>
    </div>

    <div v-if="userShoppingLists">
      <p v-for="(item, name) in userShoppingLists" :key="name">
        {{ name }}
      </p>
    </div>



    <div className="itemListContainer">
      <div className="top">
        <p>Shoppingify allows you to take your shopping list wherever you go</p>
        <input type="text" placeholder="search">
      </div>

      <div className="content">
        <div className="category" v-for="(category, index) in categories" :key="index">
          <p>{{ category }}</p>
            <div className="categoryContents">
             <div v-for="(item, index) in getCategoryItems(category)" className="item">
              <p>{{ item.name }}</p>
              <button @click="handleAddItem(item)">+</button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </main>
</template>

<style scoped>
select:required:invalid {
  color: #666;
}

option[value=""][disabled] {
  display: none;
}

option {
  color: #000;
}

.itemContainer {}

.item {
  border-radius: 12px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  width: fit-content;
  gap: 1rem;
  padding: .5rem 1rem;
}

.item button {
  background-color: transparent;
  color: rgba(193, 193, 196, 1);
  border: transparent;
  cursor: pointer;
}

.shoppingListContainer {
  border: 1px solid black;
}

.shoppingListItem {
  display: flex;
  gap: 2rem;
}

.piecesContainer {
  display: flex;
}

.itemListContainer {
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem;
}

.categoryContents {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
