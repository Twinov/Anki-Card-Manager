<script lang='ts'>
  import 'smelte/src/tailwind.css'
  import { Button } from 'smelte'
  import { APIENDPOINT } from '../constants'

  const massSentencesAdd = () => {
    fetch(`${APIENDPOINT}/mass_sentence_add`, { method: 'POST' })
  }
</script>

<div class="py-2">
  <Button block on:click={massSentencesAdd}>Add sentences to all flashcards</Button>
</div>
<div class='py-2'>
  <Button on:click={() => massSentencesAdd()}>Add sentences to all flashcards</Button>
</div>
