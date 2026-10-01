import { useEffect, useState } from "react";

const API = "https://rickandmortyapi.com/api/character";

function App() {
  const [personagens, setPersonagens] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("");
  const [especie, setEspecie] = useState("");
  const [genero, setGenero] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [personagemSelecionado, setPersonagemSelecionado] = useState(null);

  useEffect(() => {
    buscarPersonagens();
  }, [pagina, nome, status, especie, genero]);

  async function buscarPersonagens() {
    setLoading(true);
    setErro("");

    const params = new URLSearchParams();

    params.set("page", pagina);

    if (nome) params.set("name", nome);
    if (status) params.set("status", status);
    if (especie) params.set("species", especie);
    if (genero) params.set("gender", genero);

    try {
      const resposta = await fetch(`${API}?${params.toString()}`);

      if (resposta.status === 404) {
        setPersonagens([]);
        setTotalRegistros(0);
        setTotalPaginas(1);
        return;
      }

      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}`);
      }

      const dados = await resposta.json();

      setPersonagens(dados.results);
      setTotalPaginas(dados.info.pages);
      setTotalRegistros(dados.info.count);
    } catch (error) {
      setErro(error.message);
      setPersonagens([]);
    } finally {
      setLoading(false);
    }
  }

  function limparFiltros() {
    setNome("");
    setStatus("");
    setEspecie("");
    setGenero("");
    setPagina(1);
  }

  function statusTexto(status) {
    if (status === "Alive") return "Vivo";
    if (status === "Dead") return "Morto";
    return "Desconhecido";
  }

  function generoTexto(genero) {
    if (genero === "Male") return "Masculino";
    if (genero === "Female") return "Feminino";
    if (genero === "Genderless") return "Sem gênero";
    return "Desconhecido";
  }

  function statusClasse(status) {
    if (status === "Alive") return "vivo";
    if (status === "Dead") return "morto";
    return "";
  }

  return (
    <div className="app">
      <header>
        <h1>API Hunters</h1>
        <p>Consulte personagens de Rick and Morty através de uma API.</p>
      </header>

      <main>
        <section className="filtros">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              setPagina(1);
            }}
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos os status</option>
            <option value="alive">Vivo</option>
            <option value="dead">Morto</option>
            <option value="unknown">Desconhecido</option>
          </select>

          <select
            value={especie}
            onChange={(event) => {
              setEspecie(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todas as espécies</option>
            <option value="Human">Humano</option>
            <option value="Alien">Alienígena</option>
          </select>

          <select
            value={genero}
            onChange={(event) => {
              setGenero(event.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos os gêneros</option>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
            <option value="genderless">Sem gênero</option>
            <option value="unknown">Desconhecido</option>
          </select>

          <button onClick={limparFiltros}>Limpar</button>
        </section>

        <section className="resumo">
          {loading
            ? "Consultando a API..."
            : `${totalRegistros} registro(s) encontrado(s)`}
        </section>

        {loading && (
          <section className="estado">
            <p>Carregando...</p>
          </section>
        )}

        {!loading && erro && (
          <section className="estado erro">
            <h2>Erro</h2>
            <p>{erro}. Tente novamente.</p>

            <button onClick={buscarPersonagens}>Tentar novamente</button>
          </section>
        )}

        {!loading && !erro && personagens.length === 0 && (
          <section className="estado vazio">
            <h2>Nenhum personagem encontrado</h2>

            <p>
              {nome
                ? `Nada encontrado para "${nome}". Tente outro nome ou remova algum filtro.`
                : "Tente remover algum filtro para ampliar a consulta."}
            </p>
          </section>
        )}

        {!loading && !erro && personagens.length > 0 && (
          <>
            <ul className="grade">
              {personagens.map((personagem) => (
                <li key={personagem.id}>
                  <button
                    className="ficha"
                    type="button"
                    onClick={() => setPersonagemSelecionado(personagem)}
                  >
                    <div className="retrato">
                      <img
                        src={personagem.image}
                        alt={personagem.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="dados">
                      <span className="id">
                        #{String(personagem.id).padStart(3, "0")}
                      </span>

                      <h3>{personagem.name}</h3>

                      <span
                        className={`sinal ${statusClasse(personagem.status)}`}
                      >
                        {statusTexto(personagem.status)} · {personagem.species}
                      </span>

                      <dl>
                        <div>
                          <dt>Origem:</dt>
                          <dd>{personagem.origin.name}</dd>
                        </div>

                        <div>
                          <dt>Local:</dt>
                          <dd>{personagem.location.name}</dd>
                        </div>
                      </dl>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {totalPaginas > 1 && (
              <section className="paginacao">
                <button
                  disabled={pagina === 1}
                  onClick={() => {
                    setPagina(pagina - 1);
                    window.scrollTo(0, 0);
                  }}
                >
                  Anterior
                </button>

                <span>
                  Página {pagina} de {totalPaginas}
                </span>

                <button
                  disabled={pagina === totalPaginas}
                  onClick={() => {
                    setPagina(pagina + 1);
                    window.scrollTo(0, 0);
                  }}
                >
                  Próxima
                </button>
              </section>
            )}
          </>
        )}
      </main>

      {personagemSelecionado && (
        <div
          className="painel"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPersonagemSelecionado(null);
            }
          }}
        >
          <div className="painel-conteudo">
            <button
              className="painel-fechar"
              onClick={() => setPersonagemSelecionado(null)}
            >
              ×
            </button>

            <span className="painel-id">
              Registro #{String(personagemSelecionado.id).padStart(3, "0")}
            </span>

            <h2>{personagemSelecionado.name}</h2>

            <span
              className={`sinal ${statusClasse(personagemSelecionado.status)}`}
            >
              {statusTexto(personagemSelecionado.status)}
            </span>

            <table>
              <tbody>
                <tr>
                  <th>Espécie</th>
                  <td>{personagemSelecionado.species}</td>
                </tr>

                {personagemSelecionado.type && (
                  <tr>
                    <th>Subtipo</th>
                    <td>{personagemSelecionado.type}</td>
                  </tr>
                )}

                <tr>
                  <th>Gênero</th>
                  <td>{generoTexto(personagemSelecionado.gender)}</td>
                </tr>

                <tr>
                  <th>Origem</th>
                  <td>{personagemSelecionado.origin.name}</td>
                </tr>

                <tr>
                  <th>Última localização</th>
                  <td>{personagemSelecionado.location.name}</td>
                </tr>

                <tr>
                  <th>Episódios</th>
                  <td>{personagemSelecionado.episode.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
