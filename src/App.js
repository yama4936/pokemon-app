import { useEffect, useState } from 'react';
import PokemonThumbnails from './PokemonThumbnails';
import pokemonJson from "./pokemon.json";
import pokemonTypeJson from "./pokemonType.json";

function App() {

  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);  // 検索結果のための状態追加
  const [inputValue, setInputValue] = useState("");  // 検索フォームの状態

  // APIからデータを取得する
  const [url, setUrl] = useState("https://pokeapi.co/api/v2/pokemon?limit=50");
  const [isLoading, setIsLoading] = useState(false);

  const getAllPokemons = () => {
    setIsLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setUrl(data.next);
        createPokemonObject(data.results);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }

  const createPokemonObject = (results) => {
    results.forEach(pokemon => {
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
      fetch(pokemonUrl)
        .then(res => res.json())
        .then(async (data) => {
          const _image = data.sprites.other["official-artwork"].front_default;
          const _iconImage = data.sprites.other.dream_world.front_default;
          const _type = data.types[0].type.name;
          const japanese = await translateToJapanese(data.name, _type);
          const newList = {
            id: data.id,
            name: data.name,
            iconImage: _iconImage,
            image: _image,
            type: _type,
            jpName: japanese.name,
            jpType: japanese.type
          }

          // ポケモンがすでにリストに存在するか確認する
          setAllPokemons((currentList) => {
            const isAlreadyAdded = currentList.some(p => p.id === newList.id);
            if (!isAlreadyAdded) {
              const updatedList = [...currentList, newList];
              setFilteredPokemons(updatedList);  // フィルタリング用リストも更新
              return updatedList;
            }
            return currentList;
          });
        })
    })
  }

  const translateToJapanese = async (name, type) => {
    const pokemonData = pokemonJson.find(
      (pokemon) => pokemon.en.toLowerCase() === name.toLowerCase()
    );

    const jpName = pokemonData ? pokemonData.ja : "名前不明";
    const jpType = pokemonTypeJson[type] || "タイプ不明";

    return { name: jpName, type: jpType };
  };

  // 検索欄への入力値をハンドリング
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    search(e.target.value);
  }

  // 検索欄への入力値での絞り込み
  const search = (value) => {
    if (value === "") {
      setFilteredPokemons(allPokemons);
      return;
    }

    const searchedPokemons = allPokemons.filter(
      (pokemon) =>
        pokemon.name.toUpperCase().includes(value.toUpperCase()) ||
        pokemon.jpName.includes(value)
    );

    setFilteredPokemons(searchedPokemons);
  }

  useEffect(() => {
    getAllPokemons();
  }, []);  // 初回レンダリング時のみAPIからポケモンを取得する

  return (
    <div className="app-container">
      <h1>ポケモン図鑑</h1>
      {/* フリーキーワード検索フォーム */}
      <div>
        <h4>Search</h4>
        <input type="text" value={inputValue} onChange={handleInputChange} />
      </div>
      <div className='pokemon-container'>
        <div className='all-container'>
          {filteredPokemons.sort((a, b) => a.id - b.id).map((pokemon, index) => (
            <PokemonThumbnails
              id={pokemon.id}
              name={pokemon.name}
              image={pokemon.image}
              iconImage={pokemon.iconImage}
              type={pokemon.type}
              key={index}
              jpName={pokemon.jpName}
              jpType={pokemon.jpType}
            />
          ))}
        </div>
        {isLoading ? (
          <div className='load-more'>now loading...</div>
        ) : (
          <button className='load-more' onClick={getAllPokemons}>
            もっとみる！
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
