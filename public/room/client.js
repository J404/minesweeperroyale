Vue.component('modal', {
    template: `
        <div id='modal' v-if="showmodal">
            <h4>{{ headertext }}</h4>
            <p>{{ bodytext }}</p>
            <input v-if="inputbox" type="text" :placeholder="placeholdtext"
            v-model="value">
            <button @click="exit()">{{ buttontext }}</button>
        </div>
    `,
    props: {
        headertext: String,
        bodytext: String,
        inputbox: Boolean,
        placeholdtext: String,
        buttontext: String,
        showmodal: Boolean,
    },
    data: function() {
        return {
            value: ''
        }
    },
    methods: {
        exit: function() {
            this.$emit('close-modal', this.value);
        }
    }
});

const app = new Vue({
    el: '#app',
    data: {
        players: [],
        client: {},
        status: '',
        canPlay: false,
        modalData: {
            headerText: '', bodyText: '', inputBox: false,
            placeholdText: '', buttonText: '', showModal: Boolean,
            fieldValue: '',
        },
    },
    created: function() {
        // Name prompt modal
        this.modalData.headerText = 'Howdy, sailor!';
        this.modalData.bodyText = 'Let us know what you want to be called.';
        this.modalData.inputBox = true;
        this.modalData.placeholdText = 'Nickname';
        this.modalData.buttonText = 'Join Room';
        this.modalData.showModal = true;
    },
    methods: {
        startGame: function() {
            sendStart();
        },
        closeModal: function(fieldValue) {
            this.modalData.showModal = false;
            
            // If gottenNick is false, then this modal must be for nickname
            if (!gottenNick) {
                sendNick(fieldValue);
            }
        }
    }
});