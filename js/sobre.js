export function renderSobre(main) {
  main.innerHTML = `
    <!-- Hero Parallax -->
    <section class="parallax-sobre">
      <div class="parallax-content">
        <h2>Sobre a JELLI Group</h2>
        <p>Desde 2010, conectamos pessoas e histórias por meio da paixão por carros antigos. Somos mais que uma concessionária: preservamos memórias sobre rodas e celebramos o melhor do automobilismo clássico.</p>
      </div>
    </section>

    <!-- Intro -->
    <section class="section-sobre">
      <h2>Nossa essência</h2>
      <p>Em um ambiente amplo e cuidadosamente planejado, proporcionamos uma verdadeira viagem no tempo. Nossa loja é um espaço onde o passado ganha vida e cada veículo exibe com orgulho sua história.</p>
      <p>Mais do que comercializar veículos, oferecemos uma experiência completa: orientação especializada, apoio na formação de acervos e eventos que celebram a cultura automotiva.</p>
    </section>

    <!-- Métricas -->
    <section class="sobre-metricas">
      <div class="metric"><span class="num">15+</span><span class="lbl">anos de história</span></div>
      <div class="metric"><span class="num">300+</span><span class="lbl">clássicos entregues</span></div>
      <div class="metric"><span class="num">1.2k+</span><span class="lbl">entusiastas atendidos</span></div>
      <div class="metric"><span class="num">80+</span><span class="lbl">eventos realizados</span></div>
    </section>

    <!-- Valores e Diferenciais -->
    <section class="sobre-cards">
      <article class="card">
        <h3>Missão</h3>
        <p>Manter viva a cultura automotiva, honrando histórias e criando novas conexões entre pessoas e máquinas.</p>
      </article>
      <article class="card">
        <h3>Valores</h3>
        <p>Autenticidade, respeito à originalidade, transparência e atendimento humano em cada etapa.</p>
      </article>
      <article class="card">
        <h3>Diferenciais</h3>
        <p>Curadoria rigorosa, procedência garantida, consultoria para colecionadores e experiência imersiva.</p>
      </article>
      <article class="card">
        <h3>Compromisso</h3>
        <p>Cada carro é uma cápsula do tempo. Nosso compromisso é preservá-la com excelência e responsabilidade.</p>
      </article>
    </section>

    <!-- Parallax citação -->
    <section class="parallax-sobre-2">
      <div class="parallax-content">
        <h2>“Clássicos não envelhecem — tornam-se lendas.”</h2>
        <p>Nosso acervo é selecionado para despertar memórias e inspirar novas jornadas.</p>
      </div>
    </section>

    <!-- Timeline básica -->
    <section class="sobre-timeline">
      <h2>Nossa trajetória</h2>
      <ul class="timeline">
        <li><span class="ano">2010</span> Fundação do JELLI Group e primeiros clássicos no acervo</li>
        <li><span class="ano">2014</span> Primeiros eventos temáticos para a comunidade</li>
        <li><span class="ano">2018</span> Expansão do showroom e consultoria para colecionadores</li>
        <li><span class="ano">2023</span> Acervo internacional e destaque em publicações do setor</li>
      </ul>
    </section>

    <!-- Parallax CTA -->
    <section class="parallax-sobre-cta">
      <div class="parallax-content">
        <h2>Venha viver essa experiência</h2>
        <p>Agende uma visita ou fale com nossa equipe para conhecer o acervo.</p>
        <a href="#contato" class="btn-cta">Falar com a equipe</a>
      </div>
    </section>
  `;
}
