const app = new Vue({
    el: '#app',
    data: {
        players: [],
        client: {},
        status: '',
        canPlay: false,
    },
    methods: {
        startGame: function() {
            sendStart();
        }
    }
});