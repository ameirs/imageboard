import { commentsComponent } from "./comments-component.js";

export default {
    data() {
        return {
            image: {},
            date: "",
            nextImg: null,
            prevImg: null,
        };
    },
    props: ["imageId"],
    watch: {
        imageId() {
            fetch(`/image-overlay/${this.imageId}`)
                .then((res) => res.json())
                .then((data) => {
                    this.image = data;
                })
                .catch((err) => {
                    console.log("error", err);
                });
        },
    },

    components: {
        comments: commentsComponent,
    },

    mounted() {
        const path = `/image-overlay/${this.imageId}`;
        fetch(path)
            .then((res) => res.json())
            .then((data) => {
                this.image = data;
                this.prevImg = data.prevId;
                this.nextImg = data.nextId;
            })
            .catch((err) => {
                history.replaceState({}, "", "/");
                window.location.reload();
            });
    },

    template: ` 
    <div id = "overlay">  
        
            <div id= "image-container">
            <img :src="image.url" :alt="image.title">
                <div class="description-box">
                    <p>{{image.title}}</p> 
                    <p>by {{image.username}} {{image.moment}} </p> 
                    <p id="image-desc">{{image.description}}</p> 
                    <comments :image-id="imageId"></comments>
                </div>
            <div class="btn-container"><div class="close-button" @click="closeModal"></div></div>

            </div>
            
        </div>
        
    `,

    methods: {
        closeModal(e) {
            this.$emit("close", "closed overlay");
        },

        showPrevImg(e) {
            this.$emit("previous-img", this.prevImg);
        },
        showNextImg(e) {
            this.$emit("next-img", this.nextImg);
        },
    },
};
