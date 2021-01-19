Vue.component('modal', {
    template: `
        <div id='modal' v-if="showmodal">
            <h2>{{ headertext }}</h2>
            <p>{{ bodytext }}</p>
            <input v-if="inputbox" type="text" :placeholder="placeholdtext"
            @keyup.enter="exit()" v-model="value">
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
        this.showModal('Howdy Sailor!',
        'Let us know what you want to be called.',
        true, 'Nickname',
        'Enter Room');
    },
    methods: {
        startGame: function() {
            sendStart();
        },
        showModal: function(headerText, bodyText, inputBox,
                            placeholdText, buttonText) {
            this.modalData.headerText = headerText;
            this.modalData.bodyText = bodyText;
            this.modalData.inputBox = inputBox;
            this.modalData.placeholdText = placeholdText;
            this.modalData.buttonText = buttonText;
            this.modalData.showModal = true;
        },
        closeModal: function(fieldValue) {
            this.modalData.showModal = false;
            
            // If sentNick is false, then this modal must be for nickname
            if (!sentNick) {
                sendNick(fieldValue);
            }
        }
    }
});