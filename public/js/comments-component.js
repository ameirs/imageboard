const commentsComponent = {
    data() {
        return {
            username: "",
            commentText: "",
            comments: [],
            dates: [],
        };
    },
    props: ["imageId"],

    mounted() {
        const path = "/comments/"
            .concat(this.imageId.toString())
            .concat(".json");
        fetch(path)
            .then((res) => res.json())
            .then((data) => {
                this.comments = data;
            })
            .catch((err) => {
                console.log("err in comments client side: ", err);
            });
    },
    template: ` 
    
        <input v-model="username" name="username" placeholder="Username"> 
        
        <input v-model="commentText" name="commentText" placeholder="Comments">
       <input id="btn-comment" v-on:click="submit" type="image" src="./send2.svg" name="submit" alt="submit"/>
      
        
          <div v-for="each in comments" class="comments">
            <div>
                <span class="comment-username">{{each.username}}</span>
                <span class="comment-date"> • {{each.moment}}</span>
            </div>
            <div>
                <span class="comment-text">{{each.comment_text}}</span>
            </div>
        </div>
        `,
    methods: {
        submit() {
            const data = {
                commentText: this.commentText,
                username: this.username,
                imageId: this.imageId,
            };
            const stringifiedJSONData = JSON.stringify(data);
            fetch("/comment.json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: stringifiedJSONData,
            })
                .then((data) => {
                    return data.json();
                })
                .then((data) => {
                    this.comments.unshift(data);
                    this.dates.push(data.moment);
                })
                .catch((err) => {
                    console.log("error in fetch images from server:", err);
                });
        },
    },
};

export { commentsComponent };
