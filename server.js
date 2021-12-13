const express = require("express");
const { join } = require("path");
const { readFile, writeFile } = require("fs");
const morgan = require("morgan");

const port = 3001;
const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  try {
    res.sendFile(join(__dirname, "src/index.html"));
  } catch (e) {
    next(e);
  }
});

app.get("/about", (req, res) => {
  try {
    res.sendFile(join(__dirname, "src/about.html"));
  } catch (e) {
    next(e);
  }
});

app.get("/newsletter", (req, res) => {
  try {
    res.sendFile(join(__dirname, "src/newsletter.html"));
  } catch (e) {
    next(e);
  }
});

let pokeFile = join(__dirname, "pokemon.json");


app.get("/pokemon/:id?", (req, res) => {
  try {
    let { id } = req.params;

    if (id) {
      if (isNaN(id)) return new Error("Invalid pokemon id");

      readFile(pokeFile, (err, data) => {
        if (err) return next(e);

        let pokemon = JSON.parse(data.toString()).pokemon.filter(
          (poke) => poke.id == id
        );
        res.json(pokemon);
      });
    } else {
      res.sendFile(pokeFile);
    }
  } catch (e) {
    next(e);
  }
});

app.post("/pokemon", (req, res, next) => {
  try {
    let newPokemon = req.body;

    readFile(pokeFile, (err, data) => {
      if (err) return next(e);

      try {    
        let newPokemonList = JSON.parse(data.toString());


        let newId = newPokemonList[newPokemonList.length - 1].id + 1;
        newPokemon.id = newId;
        newPokemon.num = newId.toString().padStart(3, "0");

        newPokemonList.push(newPokemon);

        writeFile(pokeFile, JSON.stringify(newPokemonList), (err) => {
          if (err) return next(e);

          res.json({ msg: `Successfully added ${newPokemon.name} pokemon.` });
        });
      } catch (e) {
        next(e);
      }
    });
  } catch (e) {
    next(e);
  }
});

app.put("/pokemon/:id", (req, res, next) => {
  try {
    let { id } = req.params;
    let newDetails = req.body;

    if (isNaN(id)) {
      throw new Error("Invalid pokemon ID");
    } else {
      readFile(pokeFile, (err, data) => {
        if (err) return next(e);

        try {
          let newPokemonList = JSON.parse(data.toString()).map((poke) => {
            if (poke.id == id) {
              return { ...poke, ...newDetails };
            }
            return poke;
          });

          writeFile(pokeFile, JSON.stringify(newPokemonList), (err) => {
            if (err) return next(e);

            res.json({ msg: `Successfully updated pokemon with ${id}.` });
          });
        } catch (e) {
          next(e);
        }
      });
    }
  } catch (e) {
    next(e);
  }
});

app.delete("/pokemon/:id", (req, res, next) => {
    try {
        readFile(pokeFile, (err, data) => {
            let { id } = req.params;
            if (err) return next(e);
    
            try {
              let newPokemonList = JSON.parse(data.toString()).filter((poke) => poke.id != id);
    
              writeFile(pokeFile, JSON.stringify(newPokemonList), (err) => {
                if (err) return next(e);
    
                res.json({ msg: `Successfully deleted pokemon with ${id}.` });
              });
            } catch (e) {
              next(e);
            }
          });

    } catch (e) {
        next(e);
    }
})

app.use((req, res, next) => {
  try {
    res.status(404).sendFile(join(__dirname, "src/notFound.html"));
  } catch (e) {
    next(e);
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    name: err.name || "Unknown",
    msg: err.message || "An unexpected error has occurred.",
  });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
