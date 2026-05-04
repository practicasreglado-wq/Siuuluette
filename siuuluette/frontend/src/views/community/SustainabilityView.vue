<template>
  <LegalLayout title="Sostenibilidad" section="Comunidad">

    <p class="lead">
      Le Siuuluette no nace para producir más ropa. Nace para producir
      <strong>la ropa correcta</strong>: pocas unidades, de calidad real, fabricada en Europa,
      con materiales que duran. Nuestro modelo de drops limitados es intrínsecamente más
      sostenible que el fast fashion porque produce solo lo que se va a vender.
    </p>

    <h2>Nuestros principios</h2>

    <h3>1. Pocas unidades, sin excedente</h3>
    <p>
      Cada drop tiene una tirada finita y numerada. No hay restock, no hay outlet, no hay
      stock sobrante que termine en saldo o destrucción. Producimos lo que la comunidad va a
      llevar, ni una unidad más. Esta restricción operativa, que muchos verían como una
      limitación, es nuestra mayor contribución medioambiental: no participamos en la
      maquinaria de la sobreproducción textil.
    </p>

    <h3>2. Producción europea</h3>
    <p>
      Nuestras prendas se confeccionan en talleres seleccionados en España, Portugal e
      Italia. Esta decisión, además de garantizarnos un control de calidad cercano, reduce
      drásticamente la huella de carbono asociada al transporte intercontinental que
      caracteriza al fast fashion convencional.
    </p>

    <h3>3. Materiales certificados y duraderos</h3>
    <p>
      Trabajamos con tejidos premium, técnicos y, siempre que es posible, con certificaciones
      reconocidas (GOTS, OEKO-TEX, Recycled Claim Standard). El objetivo es claro: que cada
      prenda dure años, no temporadas. La verdadera sostenibilidad empieza por hacer ropa
      que el consumidor quiera conservar.
    </p>

    <h3>4. Packaging consciente</h3>
    <p>
      Nuestro packaging premium está diseñado en materiales 100% reciclables y, cuando es
      posible, biodegradables. Aunque mantenemos un alto estándar visual y táctil, en cada
      decisión priorizamos materiales que cierren correctamente su ciclo de vida.
    </p>

    <h3>5. Trazabilidad y transparencia</h3>
    <p>
      Estamos comprometidos a publicar progresivamente la trazabilidad completa de nuestra
      cadena de suministro: dónde se fabrica cada prenda, con qué materiales, qué talleres
      están involucrados y bajo qué condiciones laborales. La transparencia es la única vía
      honesta de reclamar sostenibilidad.
    </p>

    <h2>Compromiso social</h2>
    <p>
      Un porcentaje de cada drop se destina a iniciativas sociales vinculadas al deporte:
      becas para atletas jóvenes con talento sin recursos, programas de salud mental en el
      deporte de alto rendimiento, y colaboraciones con ONGs de inclusión deportiva.
    </p>
    <p>
      Hablamos del deporte como vehículo de superación personal: lo justo es que parte del
      valor que generamos como marca vuelva a quienes encarnan esa filosofía en su vida real.
    </p>

    <h2>Lo que aún no somos</h2>
    <p>
      Queremos ser honestos. Le Siuuluette es una marca joven y aún tenemos camino por
      recorrer. <strong>No nos consideramos todavía una marca "100% sostenible"</strong> —
      nadie en la moda lo es de verdad — y no vamos a hacer greenwashing.
    </p>
    <p>
      Lo que sí prometemos es:
    </p>
    <ul>
      <li>Reportar progresivamente nuestro impacto real con datos verificables.</li>
      <li>Mejorar año a año la circularidad de nuestros materiales.</li>
      <li>Mantener el modelo de pocas unidades como principio innegociable.</li>
      <li>No copiar prácticas del fast fashion bajo ninguna circunstancia.</li>
    </ul>

    <h2>Informe de impacto</h2>
    <p class="callout">
      A partir del segundo año de operación publicaremos un informe anual de impacto ESG
      con datos verificados sobre nuestra huella de carbono, condiciones laborales en la
      cadena de suministro, donaciones realizadas y avances hacia los objetivos de
      circularidad.
    </p>
  </LegalLayout>
</template>

<script>
import LegalLayout from '../../components/LegalLayout.vue'

export default {
  name: 'SustainabilityView',
  components: { LegalLayout },
}
</script>

<style scoped>
.lead {
  font-size: 1.05rem !important;
  line-height: 1.7;
  color: var(--c-off-white) !important;
}
</style>
