const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);

const {app, runServer, closeServer} = require("../server");

describe("Blogpost", function() {
    // start the server and return the promise from server in order to wait for connection 
    // before running tests
    before(function() {
        return runServer;
    });
    // close server and return promise from closeServer function
    // to prevent other tests from running before server closes
    after(function() {
        return closeServer;
    });

    it("Should get all blog posts on GET", function() {
        return chai.request(app)
        .get("/blog-posts")
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.length(2);
        })
    });

    it ("Should create a post on POST", function() {
        const newItem ={
            title: "This is it",
            content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
            "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
            "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo " +
            "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
            "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non " +
            "proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            author: "Elena Granados"   
        };

        const expectedKeys = ["id", "publishDate"].concat(Object.keys(newItem));
        return chai.request(app)
        .post("/blog-posts")
        .send(newItem)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a("object");
            expect(res.body.id).to.not.equal(null);
            expect(res.body).to.have.all.keys(expectedKeys);
            expect(res.body).to.be.deep.equal(Object.assign(newItem, {id: res.body.id, publishDate: res.body.publishDate}));
        });
    });

    it("Should give error if key missing on POST", function() {
        const newItem ={
            title: "This is it",
            author: "Elena Granados"
          
        };
        
        return chai.request(app)
        .post("/blog-posts")
        .send(newItem)
        .then(function(res) {
            expect(res).to.have.status(400);
            expect(res).to.be.a("object");
        });
    });

    it("Should update item on PUT", function() {
        const updateItem = {
            title: "This is it",
            content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
            "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
            "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo " +
            "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
            "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non " +
            "proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            author: "Elena Granados"
        };

        // need to call get to get the id of an item to update
        return (
            chai.request(app)
            .get("/blog-posts")
            .then(function(res) {
                updateItem.id = res.body[0].id;
                updateItem.publishDate = res.body[0].publishDate;
                return chai.request(app)
                .put(`/blog-posts/${updateItem.id}`)
                .send(updateItem)
                .then(function(res) {
                    expect(res).to.have.status(200); 
                    expect(res.body).to.be.a("object");
                    expect(res).to.be.json;
                    expect(res.body).to.be.deep.equal(updateItem);  
                });
            })
        );
    });

    it("Should give error if required field is missing on PUT", function() {
        const updateItem = {
            title: "This is it",
            content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
            "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
            "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo " +
            "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
            "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non " +
            "proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            author: "Elena Granados"
        };
        return (
            chai.request(app)
            .get("/blog-posts")
            .then(function(res) {
                updateItem.id = res.body[0].id;
                return chai.request(app)
                .put(`/blog-posts/${updateItem.id}`)
                .send(updateItem)
                .then(function(res) {
                    expect(res).to.have.status(400);
                    expect(res).to.be.a("object");
                })
            })
        );
    }); 

    it("Should give error if id does not match on PUT", function() {
        return (
            chai.request(app)
            .get("/blog-posts")
            .then(function(res) {
                const updateItem = Object.assign(res.body[0], {title: "I have come to live in peace", content: "yeaH for sure, dude"});
                return chai.request(app)
                .put(`/blog-posts/1234`)
                .send(updateItem)
                .then(function(res) {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a("object");
                })
            })
        );
    })

    it("Should delete item on DELETE", function() {
        return (
            chai.request(app)
            .get("/blog-posts")
            .then(function(res) {
                return chai.request(app)
                .delete(`/blog-posts/${res.body[0].id}`)
                .then(function(res) {
                    expect(res).to.have.status(204);
                })
            })
        );
    });
})