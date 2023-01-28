
const express = require("express");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://kostas:6974623684@cluster0.bh08hui.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema ({
    name: String
   
});

const Item =  mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your todolist!"
});

const item2 = new Item ({
    name: "Hit the + button to add a new item"
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items:[itemsSchema]
};

const List =  mongoose.model("List", listSchema);



               //daily list
app.get("/", function(req, res){
    
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("error");
                } else {
                    console.log("Success");
                }
            });
            res.redirect("/");
        } else {
             res.render('list', {listTitle: "Today", newListItems: foundItems});
        }

    });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${listName}`);
        })
    }
    
});    

app.post("/delete", function(req, res) {
    const deleteItem = req.body.checkbox;
    const listName = req.body.listName;

        if (listName === "Today"){
            Item.deleteOne({name: deleteItem}, function (err) {
            res.redirect("/");
            });
        } else {
            List.findOneAndUpdate({name:listName}, {$pull: {items: {name: deleteItem}}},function(err,foundList){
                    if (!err) {
                    res.redirect(`/${listName}`)
                    };
                });
        };

});


    


                // work list

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList) {
        if (!err){
            if(!foundList) {
                const list = new List({
                name:customListName,
                items: defaultItems
            });
          list.save(function() {
            res.redirect(`/${customListName}`);
          });
          
        } else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        }
        }
    });

});

app.get("/about", function(req, res){
    res.render("about");
})





app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});

