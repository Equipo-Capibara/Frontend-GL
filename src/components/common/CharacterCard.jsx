import '../../styles/characterCard.css';

export default function CharacterCard({ character, player, selected, onSelect, onRemove }) {
  return (
    <div className="character-card" style={{ backgroundColor: selected ? character.color : '#F4E0D2' }}>
      {selected && (
        <button className="close-button" onClick={onRemove}>
          ❌
        </button>
      )}
      <img src={character.img} alt={character.name} className="character-image" />
      <div className="abilities">
        <div className="ability">
          <span className="key">Z</span>
          <span className="description">{character.abilities[0]}</span>
        </div>
        <div className="ability">
          <span className="key">X</span>
          <span className="description">{character.abilities[1]}</span>
        </div>
      </div>
    </div>
  );
}
