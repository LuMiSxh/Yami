<script lang="ts">
  import type { PageData } from "./$types";
  import { Grid, Row, Column, InlineNotification } from "carbon-components-svelte";
  import { Accordion, AccordionItem } from "carbon-components-svelte";

  export let data: PageData;

  let kind: string;
  let title: string;
  let message: string;
  let showPopup = false;

  if (data["type"]) {
    if (data["type"] === "err") {
      kind = "error";
      title = "Error:";
      message = `${data["message"] ?? "No message was provided"} | Error id:${
        data["errorId"] ?? "None provided"
      }`;
      showPopup = true;
    }
    if (data["type"] === "inf") {
      kind = "success";
      title = "Success:";
      message = data["message"] ?? "No message was provided";
      showPopup = true;
    }
  }
</script>

<Grid>
  <Row>
    <Column>
      <h1 style="font-weight: bold; color: #0f62fe">Yami</h1>
    </Column>
  </Row>
  <Row padding>
    <Column>
      <h3>The new Destiny 2 API interface</h3>
    </Column>
  </Row>
  {#if showPopup}
    <InlineNotification lowContrast {kind} {title} subtitle={message} />
  {/if}
  <Row style="padding: 2rem;">
    <Column>
      <Accordion>
        <AccordionItem open title="What is Yami?">
          <p>
            Yami is a website that serves as an interface for the Bungie Destiny 2 API. Its current
            functionality includes calculating the power levels of characters and showing exotic ornaments you have not
            yet obtained and the ones you have. While the website may
            offer additional features in the future, it is currently limited by the amount of development possible.
          </p>
        </AccordionItem>
        <AccordionItem title="Data policy">
          <p>
            Yami is a website that leverages the Bungie Destiny 2 API to provide users with
            character power level calculations, ornament lookups and potentially additional features in the future. In
            terms of data storage, Yami utilizes several tools and methods to optimize performance
            and enhance user experience while respecting user privacy. Firstly, Yami utilizes a
            service-worker to cache API responses. This caching feature helps to reduce API call time
            and can provide a more responsive and faster user experience. When it comes to data privacy and EU
            regulations, Yami takes particular care to adhere to data protection laws. Specifically, Yami
            only uses cookies to store session data, which are technical cookies and are required for the site
            to run. This means that the website does not track or store any personally identifiable information
            or user data beyond what is necessary to ensure proper website functionality.
          </p>
        </AccordionItem>
        <AccordionItem title="Contribution">
          <p>
            Yami is a website that values user feedback and actively seeks to improve its services.
            There are several ways in which you can contribute to improving Yami's performance and
            functionality. One of the most effective ways to help Yami improve is to file bug
            reports on the site's <a href="https://github.com/LuMiSxh/yami" target="_blank"
          >GitHub repository</a
          >. This allows the developer to identify and address any technical issues or
            errors on the website. You can report bugs you encounter while using the website, such
            as broken links or functionality that does not work as intended. Another way to
            contribute to Yami's improvement is to make feature requests. You can suggest additional
            features or improvements you would like to see added to the site. These requests can
            help the developer to understand user's needs and preferences and tailor the
            site's services accordingly. Finally, if you have experience in web development or
            programming you can contribute to Yami's development by making pull requests on GitHub.
            This involves submitting code changes or additions that can help improve the website's
            functionality, performance, or user experience.
          </p>
        </AccordionItem>
      </Accordion>
    </Column>
  </Row>
</Grid>
