<template>
    <div>
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
    </div>
    <div>
        <p>Have an account? <button class="dontBtn" @click="emit('registering')">Login</button></p>
    </div>
</template>
<script setup>
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref } from 'vue';
import { useFirebaseAuth } from 'vuefire';

const { user } = defineProps(['user']);
const emit = defineEmits(['signedUp', 'registering']);

const auth = useFirebaseAuth();
const signUpEmail = ref('');
const signUpPassword = ref('');

const handleRegistration = () => {
    createUserWithEmailAndPassword(auth, signUpEmail.value, signUpPassword.value)
        .then((userCredential) => {
            // Signed in
            signUpEmail.value = ''
            signUpPassword.value = ''
            const signedUpUser = userCredential.user
            emit('signedUp', signedUpUser)
            //
        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message
            console.error(errorCode, errorMessage)
            // ..
        })
}
</script>
<style scoped></style>