//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://abd-ish:Abhinav123@cluster0.qrjbw6w.mongodb.net/?retryWrites=true&w=majority/todolistDB",
  {
    useNewUrlParser: true,
  }
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list",
});

const item2 = new Item({
  name: "Hit the + icon to add your new list",
});

const item3 = new Item({
  name: "-- Hit this to delete a list",
});

const defaultItem = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function (err) {});
      res.redirect("/");
    } else {
      // console.log(foundItems);

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

  const day = date.getDate();
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const currList = req.body.list;

  const temp = new List({
    name: item,
  });

  if (currList == "Today") {
    temp.save();
    res.redirect("/");
  } else {
    List.findOne({ name: currList }, function (err, foundList) {
      if (!err) {
        foundList.items.push(temp);
        foundList.save();
        res.redirect("/" + currList);
      }
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Delete successful");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) res.redirect("/" + listName);
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const customList = new List({
          name: customListName,
          items: defaultItem,
        });

        customList.save();
      }

      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
