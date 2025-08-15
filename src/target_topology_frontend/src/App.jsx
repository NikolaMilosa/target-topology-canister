import { useState } from 'react';
import { target_topology_backend } from 'declarations/target_topology_backend';

function App() {
  const [proposals, setProposals] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    target_topology_backend.get_proposals().then((proposals) => {
      console.log(proposals);
      setProposals(proposals);
    });
    return false;
  }

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="proposals">
        {proposals.map((p, index) => (
          <div key={index}>
            <strong>{p.title}</strong> — ID: {p.id.toString()}
          </div>
        ))}
      </section>
    </main>
  );
}

export default App;
