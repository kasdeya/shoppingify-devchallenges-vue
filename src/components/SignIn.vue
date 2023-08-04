<template>
    <div>
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
    </div>
    <div>
        <p>Don't have an account? <button class="dontBtn" @click="emit('registering')">register</button></p>
        <p>Currently using app as guest</p>
    </div>
</template>
<script setup>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref } from 'vue'
import { useFirebaseAuth } from 'vuefire';


const { user } = defineProps(['user']);
const emit = defineEmits(['loggedIn', 'registering'])
const signInEmail = ref('')
const signInPassword = ref('')
const auth = useFirebaseAuth()

const handleSignIn = () => {
    signInWithEmailAndPassword(auth, signInEmail.value, signInPassword.value)
        .then((userCredential) => {
            // Signed in
            signInEmail.value = ''
            signInPassword.value = ''
            const loggedInUser = userCredential.user
            emit('loggedIn', loggedInUser)
            //
        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error(errorCode, errorMessage)
        })
}

</script>
<style scoped></style>