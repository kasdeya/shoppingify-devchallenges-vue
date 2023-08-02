<script setup>

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useFirebaseAuth, useFirestore } from 'vuefire'
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'
const db = useFirestore()
const auth = useFirebaseAuth()
const user = ref()
const signUpEmail = ref('')
const signUpPassword = ref('')
const userId = ref()
const userItems = ref([])
const userShoppingLists = ref([])
const categories = ref(['Fruits and vegetables', 'Meat and fish', 'Beverages'])
const registering = ref(false)
const canSignIn = ref(true)

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
      userId.value = 'guest'
      userItems.value = []
      userShoppingLists.value = []
      fetchItemList()
      fetchShoppingList()
    }
  })
  watchEffect(() => {

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
      registering.value = false
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
        userId.value = 'guest'
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
    quantity: 1,
    uid: generateUniqueId()
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
    fetchItemList()
  } catch (error) {
    console.error('Error adding new item:', error);
  }

  activeAddItem.value = false
};

const generateUniqueId = () => {
  return uuidv4()
}

const handleAddItem = (item) => {
  const addedItem = {
    name: item.name,
    note: item.note,
    image: item.image,
    category: item.category,
    quantity: 1,
    uid: generateUniqueId()
  };

  shoppingList.value.push(addedItem);
}

const listName = ref('')
const handleAddShoppingList = async () => {
  const userRef = collection(db, 'shoppingList');
  const newList = {
    items: shoppingList.value,
    timestamp: new Date(),
    completed: false,
    cancelled: false,
  }


  try {
    await setDoc(doc(userRef, userId.value), {
      [listName.value]: newList
    }, { merge: true });
    console.log('Item added to user list successfully!')
    fetchShoppingList()
    shoppingList.value = []
  } catch (error) {
    console.error('Error adding new item:', error);
  }
}

const removeItem = (uid) => {
  shoppingList.value = shoppingList.value.filter((item) => item.uid !== uid)
}

const groupedItems = computed(() => {
  const grouped = {};
  for (const item of userItems.value) {
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

const groupedShoplistItems = computed(() => {
  const grouped = {};
  for (const item of viewingList.value.items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item)
  }
  return grouped
})

const getShoplistItems = (category) => {
  return groupedShoplistItems.value[category] || [];
}

const groupedListItems = computed(() => {
  const grouped = {};
  for (const item of shoppingList.value) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item)
  }
  return grouped
})

const getListItems = (category) => {
  return groupedListItems.value[category] || [];
}
const groupedShopLists = ref()
const groupedShoppingLists = computed(() => {
  const grouped = {};
  for (const listName in userShoppingLists.value) {
    const list = userShoppingLists.value[listName];
    const timestamp = list.timestamp;
    const date = new Date(timestamp.seconds * 1000);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }

    grouped[monthYear].push({ ...list, name: listName });
  }

  groupedShopLists.value = grouped
  calculateItemsPerMonth()
  chartDataGen()
  countTops()
  return grouped;
});

const formatDate = (timestamp) => {
  const dateObj = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  return dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

const activeAddItem = ref(false)
const categoryInputActive = ref(false)
const activeCheckItem = ref()

const handleClickItem = (item) => {
  activeAddItem.value = false
  activeCheckItem.value = item

}

const handleItemDeletion = async () => {
  const userRef = doc(db, 'itemList', userId.value)
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const itemList = userSnapshot.data().items || [];

    // Find the index of the item with the given item uid
    const index = itemList.findIndex(item => {
      console.log('item:', item.uid, 'active:', activeCheckItem.value.uid);
      return item.uid === activeCheckItem.value.uid;
    });

    console.log(itemList, index)
    if (index !== -1) {
      // Remove the item from the array
      itemList.splice(index, 1);
    }

    // Update the itemList in Firestore
    await updateDoc(userRef, { items: itemList })
      .then(() => {
        activeCheckItem.value = ''
      })
      .catch((error) => console.error('Error deleting item:', error))
  }
}

const ITEMS = 'items'
const HISTORY = 'history'
const STATISTICS = 'statistics'
const activeNav = ref(ITEMS)

const formatTimestamp = (timestamp) => {
  const dateObj = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate()
  // Array of day abbreviations (0 - Sunday, 1 - Monday, etc.)
  const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayAbbr = dayAbbreviations[dateObj.getUTCDay()];

  // Format the month without leading zero for months < 10

  const formattedMonth = month < 10 ? month.toString() : month.toString().padStart(2, '0');

  const formattedDate = `${dayAbbr} ${day}.${formattedMonth}.${year}`;

  return formattedDate
}

const viewingList = ref()
const viewingListName = ref()
const itemsPerMonth = ref()

const calculateItemsPerMonth = () => {
  const grouped = {}
  for (let key in groupedShopLists.value) {
    for (let date of groupedShopLists.value[key]) {
      if (!grouped[key]) {
        grouped[key] = date.items.length
      } else {
        grouped[key] += date.items.length
      }
    }
  }
  itemsPerMonth.value = grouped
};

const chartData = ref()
// const chartOptions = ref({ responsive: true })
const chartDataGen = () => {
  const data = {
    labels: [],
    datasets: [
      {
        label: 'items',
        backgroundColor: 'rgba(249, 161, 9, 1)',
        data: []
      }
    ]
  }

  for (let key in itemsPerMonth.value) {
    data.labels.push(key)
    data.datasets[0].data.push(itemsPerMonth.value[key])
  }
  chartData.value = data
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const topItemCounts = ref()
const topCategoryCounts = ref()
const allItemCounts = ref()
const topItemPercentages = ref()
const topCategoryPercentages = ref()
const countTops = () => {
  const grouped = groupedShopLists.value;
  const itemCounts = {};
  const categoryCounts = {};
  let totalItems = 0

  for (const month in grouped) {
    const shoppingLists = grouped[month];
    console.log(shoppingLists)

    for (const shoplist in shoppingLists) {
      const items = shoppingLists[shoplist].items;
      totalItems += shoppingLists[shoplist].items.length

      for (const item of items) {
        const itemName = item.name;
        const itemCategory = item.category

        if (itemCounts[itemName]) {
          itemCounts[itemName] += 1;
        } else {
          itemCounts[itemName] = 1;
        }
        if (categoryCounts[itemCategory]) {
          categoryCounts[itemCategory] += 1;
        } else {
          categoryCounts[itemCategory] = 1;
        }
      }
    }
  }

  const keyValueArray = Object.entries(itemCounts)
  const sortedArray = keyValueArray.sort((a, b) => b[1] - a[1])
  // const sortedObject = Object.fromEntries(sortedArray)
  const percentages = []
  for (let item of sortedArray) {
    if (percentages.length < 4) {
      let percentage = parseInt(item[1] / totalItems * 100)
      percentages.push(percentage)
    }
  }
  const categoryKeyValueArray = Object.entries(categoryCounts)
  const sortedCategoryArray = categoryKeyValueArray.sort((a, b) => b[1] - a[1])
  const categoryPercentages = []
  for (let category of sortedCategoryArray) {
    if (categoryPercentages.length < 4) {
      let percentage = category[1] / totalItems * 100
      categoryPercentages.push(percentage)
    }
  }
  const roundedSum = categoryPercentages.reduce((sum, value) => sum + Math.ceil(value), 0)
  const difference = 100 - roundedSum
  const indexToCorrect = categoryPercentages.findIndex((value) => Math.ceil(value) !== value)
  categoryPercentages[indexToCorrect] += difference
  const integers = categoryPercentages.map((value) => Math.ceil(value))
  // console.log(percentages)
  // console.log(sortedArray)
  // console.log(sortedObject)
  topItemCounts.value = sortedArray
  topCategoryCounts.value = sortedCategoryArray
  allItemCounts.value = totalItems
  topItemPercentages.value = percentages
  topCategoryPercentages.value = integers
}

</script>

<template>
  <header>
    <div class="wrapper">
    </div>
  </header>

  <main>
    <div className="mainContainer">

      <div className="leftSidebar">
        <div className="leftSidebarLogo">
          <img src="../public/logo.svg" />
        </div>
        <div className="navigation">
          <div class="itemsNav">
            <button :class="[activeNav == ITEMS ? 'activeNav' : '']" @click="activeNav = ITEMS">
              <unicon name="list-ul"></unicon>
            </button>
            <div className="tooltip">items</div>
          </div>
          <div class="historyNav">
            <button :disabled="userItems.length === 0" :class="[activeNav == HISTORY ? 'activeNav' : '']"
              @click="activeNav = HISTORY">
              <unicon name="redo"></unicon>
            </button>
            <div className="tooltip">history</div>
          </div>
          <div class="statisticsNav">
            <button :disabled="userItems.length === 0" :class="[activeNav == STATISTICS ? 'activeNav' : '']"
              @click="activeNav = STATISTICS">
              <unicon name="chart"></unicon>
            </button>
            <div className="tooltip">statistics</div>
          </div>
        </div>
        <div>
          <p style="display: none;">cart</p>
        </div>
      </div>

      <div className="itemListContainer" v-if="activeNav == ITEMS">
        <div className="top">
          <p><strong>Shoppingify</strong> allows you to take your shopping list wherever you go</p>
          <input type="text" placeholder="search">
        </div>

        <div v-if="registering" className="registerFormContainer">
          <form @submit.prevent="handleRegistration">
            <div>
              <label for="email">
                <input type="email" id="email" name="email" placeholder="email" v-model="signUpEmail">
              </label>
              <label for="password">
                <input type="password" id="pass" name="pass" placeholder="password" v-model="signUpPassword">
              </label>
            </div>
            <button class="registerBtn" type="submit">Register</button>
          </form>
          <p>Have an account? <button class="dontBtn" @click="registering = false">Login</button></p>
        </div>

        <div v-if="userId == 'guest' && !registering" className="signInFormContainer">
          <form @submit.prevent="handleSignIn">
            <div>
              <label for="email">
                <input type="email" id="email" name="email" placeholder="john@email.com" v-model="signInEmail">
              </label>
              <label for="password">
                <input type="password" id="pass" name="pass" placeholder="password" v-model="signInPassword">
              </label>
            </div>
            <button class="signInBtn" type="submit">Sign In</button>
          </form>
          <div>
            <p>Don't have an account? <button class="dontBtn" @click="registering = true">register</button></p>
            <p>Currently using app as guest</p>
          </div>
        </div>

        <div class="signOutContainer">
          <p v-if="user" class="userEmail">{{ user.email }}</p>
          <button className="signOutBtn" v-if="userId && userId !== 'guest'" @click="handleSignOut">Sign Out</button>
        </div>

        <div className="content">
          <div className="category" v-for="(category, index) in categories" :key="index">
            <p className="itemCategory">{{ category }}</p>
            <div className="categoryContents">
              <div v-for="(item, index) in getCategoryItems(category)" className="item" v-if="userItems">
                <p @click="handleClickItem(item)">{{ item.name }}</p>
                <button @click="handleAddItem(item)">
                  <unicon name="plus" width="20" fill="rgba(193, 193, 196, 1)"></unicon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="historyListContainer" v-if="activeNav == HISTORY">
        <div className="top" v-if="!viewingList">
          <p>Shopping history</p>
        </div>
        <div v-else className="viewingShopList">
          <button class="checkItemBack" @click="viewingList = '', viewingListName = ''">back</button>
          <p class="viewingListName">{{ viewingListName }}</p>
          <span class="viewingListTimestamp">{{ formatTimestamp(viewingList.timestamp) }}</span>
        </div>
        <div className="content" v-if="!viewingList">
          <div v-for="(lists, date) in groupedShoppingLists" :key="lists.name">
            <p class="groupListDate">{{ date }}</p>
            <div className="listItem" @click="viewingList = list, viewingListName = list.name" v-for="list in lists"
              :key="list.name">
              <p className="shopListName">{{ list.name }}</p>
              <div className="shopListDetails">
                <span className="shopListDate">{{ formatTimestamp(list.timestamp) }}</span>
                <span :class="[list.completed ? 'completed' : 'ongoing']" v-if="!list.cancelled">{{ list.completed ?
                  'completed' : 'ongoing' }}</span>
                <span class="cancelled" v-else>cancelled</span>
              </div>
            </div>
          </div>
        </div>
        <div class="content" v-else>
          <div className="category" v-for="(category, index) in categories" :key="index">
            <p v-if="getShoplistItems(category).length > 0" className="shopListItemCategory">{{ category }}</p>
            <div className="categoryContents">
              <div v-for="(item, index) in getShoplistItems(category)" className="item" v-if="viewingList">
                <p @click="handleClickItem(item)">{{ item.name }}</p>
                <span class="pcs"><strong>{{ item.quantity }}</strong> pcs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="statisticsContainer" v-if="activeNav == STATISTICS">
        <div class="content">
          <div class="topStatistics">

            <div class="topItems">
              <p class="topTitle">Top items</p>

              <div v-for="(item, index) in topItemCounts.slice(0, 3)" :key="index">
                <div class="itemStatContainer">
                  <div class="itemName">
                    <p>{{ item[0] }}</p>
                    <p>{{ parseInt(item[1] / allItemCounts * 100) }}%</p>
                  </div>
                  <div class="itemStatBar">
                    <div class="fill" :style="{ width: parseInt(item[1] / allItemCounts * 100) + '%' }"></div>
                    <div class="back"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="topCategories">
              <p class="topTitle">Top Categories</p>

              <div v-for="(category, index) in topCategoryCounts.slice(0, 3)" :key="index">
                <div class="itemStatContainer">
                  <div class="categoryName">
                    <p>{{ category[0] }}</p>
                    <p>{{ topCategoryPercentages[index] }}%</p>
                  </div>
                  <div class="itemStatBar">
                    <div class="fillBlue" :style="{ width: parseInt(category[1] / allItemCounts * 100) + '%' }"></div>
                    <div class="back"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="monthlySummary">
            <p class="topTitle">Monthly Summary</p>
            <div class="chartContainer">
              <Line :data="chartData" :options="{ responsive: true, maintainAspectRatio: false }" />
            </div>
          </div>
        </div>

      </div>

      <div className="rightSidebar" v-if="!activeAddItem && !activeCheckItem">
        <div className="addItemBanner">
          <img src="../public/source.svg" alt="">
          <div className="addItemRight">
            <p>Didn't find what you need?</p>
            <button @click="activeAddItem = true">Add item</button>
          </div>
        </div>
        <div v-if="shoppingList.length > 0" className="listName">
          <p>{{ listName ? listName : 'Shopping list' }}</p>
          <label for="listName">
            <unicon name="pen"></unicon>
          </label>
        </div>
        <div className="shoppingListContainer">
          <!-- <div v-for="(item, index) in shoppingList" :key="index" className="shoppingListItem"> -->
          <div v-for="(category, categoryIndex) in categories" :key="categoryIndex" v-if="shoppingList.length > 0">
            <p v-if="getListItems(category).length > 0" className="listCategory">{{ category }}</p>
            <div v-for="(item, index) in getListItems(category)" :key='index' className="shoppingListItem">
              <p>{{ item.name }}</p>
              <div className="piecesContainer">
                <button @click="removeItem(item.uid)" className="trashButton hiddenContent">
                  <unicon name="trash-alt" width="15" hover-fill="white" fill="black"></unicon>
                </button>
                <button @click="item.quantity++" className="plusButton hiddenContent">
                  <unicon name="plus" width="15"></unicon>
                </button>
                <p className="trigger">{{ item.quantity }} pcs</p>
                <button @click="item.quantity > 1 ? item.quantity-- : null" className="minusButton hiddenContent">
                  <unicon name="minus" width="15"></unicon>
                </button>
              </div>
            </div>

          </div>
          <div v-else className="emptyList">
            <p>No items</p>
          </div>
        </div>
        <div className="addListContainer">
          <img className="emptyListImage" v-if="shoppingList.length < 1" src="../public/empty.svg" alt="">
          <form @submit.prevent="handleAddShoppingList">
            <!-- <label for="listName">List name</label> -->
            <input type="text" required v-model="listName" id="listName" name="listName" placeholder="Enter a name">
            <button>Save</button>
          </form>
        </div>


      </div>

      <div v-if="activeAddItem" className="rightSidebarWhite">
        <div className="formContainer">
          <h2>Add a new item</h2>
          <form @submit.prevent="onSubmit">
            <label for="name" required>Name</label>
            <input type="text" id="name" v-model="nameInput" placeholder="Enter a name">
            <label for="note">Note (optional)</label>
            <textarea id="note" name="note" v-model="noteInput" rows="5" placeholder="Enter a note"></textarea>
            <label for="image">Image (optional)</label>
            <input type="url" id="image" v-model="imageInput" placeholder="Enter a url">
            <label for="category">Category</label>
            <div className="categoryInput">
              <div class="fakeInput" :class="{ 'fakeInputActive': categoryInputActive }">
                <p @click="categoryInputActive = !categoryInputActive" v-if="!categoryInput" className="fakePlaceholder">
                  Enter a category</p>
                <p @click="categoryInputActive = !categoryInputActive" v-if="categoryInput">
                  {{ categoryInput }}</p>
              </div>
              <div className="fakeOption" v-if="categoryInputActive">
                <ul v-for="(category, index) in categories" :key="index">
                  <li @click="categoryInput = category, categoryInputActive = false">{{ category }}</li>
                </ul>
              </div>
            </div>
            <div class="addItemButtons">
              <button @click="activeAddItem = false">cancel</button>
              <button>Save</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="activeCheckItem" className="checkItemContainer">
        <button className="checkItemBack" @click="activeCheckItem = ''">back</button>
        <img :src="activeCheckItem.image" alt="" v-if="activeCheckItem.image">
        <div>
          <label for="">name</label>
          <p className="checkItemName">{{ activeCheckItem.name }}</p>
        </div>
        <div>
          <label for="">category</label>
          <p>{{ activeCheckItem.category }}</p>
        </div>
        <div>
          <label for="">note</label>
          <p>{{ activeCheckItem.note }}</p>
        </div>
        <div className="checkItemButtons">
          <button @click="handleItemDeletion">delete</button>
          <button @click="handleAddItem(activeCheckItem), activeCheckItem = ''">Add to list</button>
        </div>
      </div>

    </div>
  </main>
</template>

<style scoped>
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
  /* border: 1px solid black; */
  padding: 1rem;
  overflow-y: scroll;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shoppingListItem {
  display: flex;
  position: relative;
  justify-content: space-between;
}

.piecesContainer {
  display: flex;
}

.itemListContainer {
  /* border: 1px solid red; */
  display: flex;
  flex-direction: column;
  padding: 1rem 3rem;
}

.categoryContents {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.top p {
  font-size: 24px;
  font-weight: 500;
}

.top strong {
  color: rgba(249, 161, 9, 1);
  font-weight: 500;
}

.top input {
  height: max-content;
  padding: 1rem 1rem;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.04);
  border: transparent;
  border-radius: 12px;
}

.top input:focus {
  outline: transparent;
}


.mainContainer {
  /* border: 1px solid yellow; */
  display: grid;
  grid-template-columns: 90px 1.8fr .5fr;
}

.rightSidebar {
  background-color: rgba(255, 240, 222, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.addListContainer {
  padding: 1rem;
  background-color: white;
  position: relative;
}

.addListContainer input {
  border: transparent;
  width: 100%;
}

.addListContainer input:focus {
  border: transparent;
  outline: transparent;
}

.addListContainer form {
  border: 2px solid rgba(249, 161, 9, 1);
  display: flex;
  justify-content: space-between;
  border-right: transparent;
  border-radius: 12px;
  padding: 0 0 0 8px;
}

.addListContainer button {
  background-color: rgba(249, 161, 9, 1);
  border: transparent;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.addItemBanner {
  padding: 1rem 1rem 0 1rem;
}

.piecesContainer p {
  margin: 1rem 0;
  color: rgba(249, 161, 10, 1);
  border: 2px solid rgba(249, 161, 10, 1);
  border-radius: 24px;
  font-size: 12px;
  width: max-content;
  text-align: center;
  display: flex;
  align-items: center;
  padding: 0 .5rem;
  font-weight: 500;
}

.piecesContainer:hover {
  background-color: white;
  border-radius: 12px;

  transition: .3s ease-in-out all;
}

.piecesContainer button {
  background-color: transparent;
  border-radius: 12px;
  border: transparent;
  cursor: pointer;
  color: rgba(249, 161, 10, 1);
}

.piecesContainer button:hover {
  background-color: rgba(249, 161, 10, 1);
  color: white;

}

.piecesContainer {
  transition: max-width 1s ease;
  white-space: nowrap;
}

.shoppingListItem p {
  align-self: center;
  position: static;
  font-weight: 500;
}

.hiddenContent {
  display: none;
}

.piecesContainer:hover .hiddenContent {
  display: inline;
}

.listName {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1rem 0 1rem;
}

.listName p {
  font-size: 18px;
  font-weight: 500;
}

.listName label {
  cursor: pointer;
}

.addItemBanner {
  background-color: rgba(128, 72, 91, 1);
  display: flex;
  margin: 2rem;
  position: relative;
  border-radius: 24px;
  padding: 1rem;
  gap: 1rem;
}


.addItemRight p {
  color: white;
  font-weight: 500;
  margin-bottom: .5rem;
}

.addItemRight button {
  background-color: white;
  border: transparent;
  border-radius: 12px;
  padding: .6rem 1.6rem;
  font-weight: 500;
  cursor: pointer;
}

.addItemBanner img {
  margin-top: -12%;
  height: 50%;
}

.listCategory {
  color: rgba(130, 130, 130, 1);
  font-size: 12px;
}

.emptyList p {
  text-align: center;
  padding: 5rem 0 15rem 0;
  font-weight: 500;
}

.emptyList {
  position: relative;
}

.emptyListImage {
  position: absolute;
  top: 0;
  margin-top: -195px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}

.itemCategory {
  margin: 1rem 0;
  font-size: 18px;
  font-weight: 500;
}

.leftSidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
}

.leftSidebarLogo {
  margin-left: auto;
  margin-right: auto;
}

.navigation {
  display: flex;
  flex-direction: column;
}

.activeNav {
  border-left: 3px solid rgba(249, 161, 9, 1) !important;
}

.navigation button {
  border: transparent;
  padding: 1rem 0;
  width: 100%;
  background-color: transparent;
  cursor: pointer;
}

.navigation button:hover {
  border-left: 3px solid rgba(249, 161, 9, 1);
  background-color: transparent;
}

.navigation div {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.navigation div:hover .tooltip {
  opacity: 1;
  pointer-events: auto;
  right: -50px;
}

.tooltip {
  background-color: rgba(69, 69, 69, 1);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  position: absolute !important;
  width: 64px;
  padding: 2px 0;
  right: -30px;
  font-weight: 600;
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tooltip::before {
  content: "";
  /* background-color: red; */
  background-color: rgba(69, 69, 69, 1);
  position: absolute;
  height: 8px;
  width: 8px;
  left: -3px;
  transform: rotate(45deg);
}



.formContainer {
  padding: 1rem;
}

.rightSidebarWhite {
  background-color: transparent;
  position: relative;
}

.formContainer form {
  display: flex;
  flex-direction: column;
}

.formContainer form input {
  border: 2px solid rgba(189, 189, 189, 1);
  border-radius: 12px;
  padding: 1rem;
  font-size: 14px;
  background-color: transparent;
}

.formContainer form input:focus {
  outline: transparent;
  border: 2px solid rgba(249, 161, 9, 1);
}

.formContainer form textarea {
  background-color: transparent;
  border: 2px solid rgba(189, 189, 189, 1);
  border-radius: 12px;
  padding: 1rem;
  font-family: inherit;
  font-size: 14px;
  resize: none;
}

.formContainer form textarea:focus {
  outline: transparent;
  border: 2px solid rgba(249, 161, 9, 1);
}

.formContainer form textarea::placeholder {
  color: rgba(189, 189, 189, 1);
}

.formContainer form input::placeholder {
  color: rgba(189, 189, 189, 1);
}

.formContainer form label {
  font-size: 13px;
  margin-top: 1rem;
  margin-bottom: .3rem;
}

.categoryInput {
  background-color: transparent;
}

.categoryInput label {
  margin-top: 1rem;
}

.fakeInput {
  border: 2px solid rgba(189, 189, 189, 1);
  background-color: transparent;
  border-radius: 12px;
  padding: 1rem;
  font-size: 14px;
}

.fakeInputActive {
  border: 2px solid rgba(249, 161, 10, 1);
}

.fakeOption {
  margin-top: 12.5px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 12px;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.14);
  padding: .5rem;
}

.fakeOption ul {
  list-style: none;
  padding: 0;
}

.fakeOption ul li {
  padding: .5rem 1.5rem;
  cursor: pointer;
}

.fakeOption ul li:hover {
  background: rgba(242, 242, 242, 1);
  border-radius: 12px;
}

.fakePlaceholder {
  color: rgba(189, 189, 189, 1) !important;
  font-size: 14px;
}

.addItemButtons {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
}

.addItemButtons button {
  padding: 1rem 1.5rem;
  cursor: pointer;
  border: transparent;
  border-radius: 12px;
  font-weight: 600;
}

.addItemButtons button:nth-child(1) {
  background-color: transparent;
}

.addItemButtons button:nth-child(2) {
  background-color: rgba(249, 161, 9, 1);
  color: white;
}

.checkItemContainer {
  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  background-color: white;
  justify-content: space-between;
}

.checkItemContainer label {
  color: rgba(193, 193, 196, 1);
  font-size: 12px;
  margin-bottom: -.8rem;
  font-weight: 500;
}

.checkItemBack {
  width: max-content;
  color: rgba(249, 161, 10, 1);
  background-color: transparent;
  border: transparent;
  font-weight: 700;
  cursor: pointer;
}

.checkItemName {
  font-size: 24px;
}

.checkItemContainer p {
  font-weight: 500;
}

.checkItemButtons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.checkItemContainer img {
  width: 100%;
  border-radius: 25px;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.checkItemButtons button {
  padding: 1rem 1rem;
  cursor: pointer;
  font-weight: 700;
  border: transparent;
  border-radius: 12px;
}

.checkItemButtons button:nth-child(1) {
  background-color: transparent;
}

.checkItemButtons button:nth-child(2) {
  background-color: rgba(249, 161, 10, 1);
  color: white;
}

.historyListContainer {
  padding: 1rem 3rem;
}

.listItem {
  background-color: white;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
  border-radius: 12px;
}

.shopListName {
  font-weight: 500;
  font-size: 18px;
}

.shopListDate {
  font-weight: 500;
  font-size: 14px;
  color: rgba(193, 193, 196, 1);
}

.shopListDetails {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.ongoing {
  /* border: 1px solid rgba(86, 204, 242, 1); */
  border: 1px solid rgba(249, 161, 9, 1);
  border-radius: 8px;
  color: rgba(249, 161, 9, 1);
  font-size: 14px;
  padding: 0px 8px;
}

.groupListDate {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 17px;
}

.viewingListName {
  font-size: 28px;
  font-weight: 700;
}

.viewingListTimestamp {
  color: rgba(193, 193, 196, 1);
  font-weight: 500;
  font-size: 14px;
}

.shopListItemCategory {
  font-weight: 500;
  font-size: 18px;
  margin: 2rem 0rem 1rem 0rem;
}

.pcs {
  color: rgba(249, 161, 10, 1);
  font-weight: 500;
  font-size: 14px;
}

strong {
  font-weight: 700;
}

.item p {
  font-size: 18px;
  font-weight: 500;
}

.itemStatBar {
  position: relative;
  width: 100%;
}

.itemStatContainer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.statisticsContainer {
  width: 100%;
}

.itemStatBar .back {
  width: 100%;
  background-color: rgba(224, 224, 224, 1);
  height: 6px;
  margin-top: -6px;
  border-radius: 4px;
}

.itemStatBar .fill {
  width: 0%;
  border-radius: 4px;
  background-color: rgba(249, 161, 9, 1);
  height: 6px;
  position: relative;
}

.itemStatBar .fillBlue {
  width: 0%;
  border-radius: 4px;
  background-color: rgba(86, 204, 242, 1);
  height: 6px;
  position: relative;
}




.statisticsContainer .content .topStatistics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem;
  gap: 1rem;
}

.statisticsContainer .content .itemName,
.statisticsContainer .content .categoryName {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.statisticsContainer p {
  font-weight: 500;
}

.topTitle {
  font-size: 24px;
}

.chartContainer {
  position: relative;
  /* height: 40vh; */
  /* width: 100%; */
}

.monthlySummary {
  position: relative;
  max-width: 100%;
  overflow-x: auto;
}

.statisticsContainer {
  overflow-x: auto;
}

.signOutContainer {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.userEmail {
  font-weight: 700;
  font-size: 14px;
}

.signOutBtn {
  cursor: pointer;
  background-color: rgba(249, 161, 10, 1);
  color: white;
  border: transparent;
  border-radius: 12px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
}

.signInFormContainer {
  display: flex;
  gap: 1rem;
}

.registerFormContainer {
  display: flex;
  gap: 1rem;
}

.signInFormContainer form div {
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.registerFormContainer form div {
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.signInFormContainer input {
  border: 1px solid rgba(249, 161, 10, 1);
  padding: .5rem;
  border-radius: 12px;
}

.signInFormContainer input:focus {
  outline: transparent;
}


.registerFormContainer input {
  border: 1px solid rgba(249, 161, 10, 1);
  padding: .5rem;
  border-radius: 12px;
}

.registerFormContainer input:focus {
  outline: transparent;
}

.signInBtn {
  margin-top: .2rem;
  cursor: pointer;
  background-color: rgba(249, 161, 10, 1);
  color: white;
  border: transparent;
  border-radius: 12px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
}

.registerBtn {
  margin-top: .2rem;
  cursor: pointer;
  background-color: rgba(249, 161, 10, 1);
  color: white;
  border: transparent;
  border-radius: 12px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
}

.dontBtn {
  background-color: transparent;
  border: transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.dontBtn:hover {
  color: rgba(86, 204, 242, 1);
}
</style>
