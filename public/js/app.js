import * as Vue from "./vue.js";
import myImageOverlay from "./image-overlay.js";

Vue.createApp({
    data() {
        return {
            images: [],
            title: "",
            username: "",
            description: "",
            file: null,
            moreButton: true,
            uploadBtn: null,
            nextImg: null,
            prevImg: null,
            imageId: location.pathname.slice(1),
        };
    },

    components: {
        "image-overlay": myImageOverlay,
    },

    mounted: function () {
        window.addEventListener("popstate", () => {
            this.currentImageId = location.pathname.slice(1);
        }),
            fetch("/images.json")
                .then((data) => data.json())
                .then((data) => {
                    this.images = data;
                });

        history.pushState({}, "", `${this.imageId}`);
    },
    methods: {
        selectImage(id) {
            this.imageId = id;
        },

        setFile(e) {
            this.file = e.target.files[0];
        },
        upload() {
            const formData = new FormData();
            formData.append("file", this.file);
            formData.append("username", this.username);
            formData.append("title", this.title);
            formData.append("description", this.description);
            fetch("/upload", {
                method: "POST",
                body: formData,
            })
                .then((data) => {
                    return data.json();
                })
                .then((data) => {
                    this.images.unshift(data);
                })
                .catch((err) => {
                });
        },

        getMoreImages() {
            let lastId = this.images[this.images.length - 1].id;
            fetch(`/moreImages/${lastId}`)
                .then((resp) => resp.json())
                .then((data) => {
                    if (data.length === 0) {
                        this.moreButton = false;
                    } else {
                        data.forEach((elem) => this.images.push(elem));
                    }
                });
        },
        closeModal(e) {
            this.imageId = null;
            history.pushState({}, "", "/");
        },

        showPrevImg(prevImg) {
            this.selectedImageId = prevImg;
        },
        showNextImg(nextImg) {
            this.selectedImageId = nextImg;
        },

        deleteImage(id) {
            this.imageId = null;
            const path = `/deleteImage/${id}`;
            fetch(path)
                .then((res) => res.json())
                .then((data) => {
                    this.comments = data;
                })
                .catch((err) => {
                });
        },
    },
}).mount("#main");
