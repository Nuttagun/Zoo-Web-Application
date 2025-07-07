interface CardItemProps {
  path: string;
  label: string;
  src: string;
  text: string;
  startDate: string;
  endDate: string;
}

function CardItem(props: CardItemProps) {
  const formattedDateRange = formatDateRange(props.startDate, props.endDate);

  function formatDateRange(start: string, end: string): string[] {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const optionsDate = {
      day: "numeric",
      month: "short",
      year: "numeric",
    } as const;

    const formattedDate = `${startDate.toLocaleDateString(
      "en-US",
      optionsDate
    )} - ${endDate.toLocaleDateString("en-US", optionsDate)}`;
    return [formattedDate];
  }

  return (
    <>
      <li className="cards__item">
        <li className="cards__item__link">
          <figure className="cards__item__pic-wrap" data-category={props.label}>
            <img
              className="cards__item__img"
              alt="Travel Image"
              src={props.src}
            />
          </figure>
          <div className="cards__item__info">
            <h5 className="cards__item__text">{props.text && props.text.length > 1 ? `${props.text.slice(0, 300)}`: props.text}</h5>
            <h3
              className="cards__item__text"
              style={{ color: "hsl(31, 88%, 46%)", marginTop: "5px" }}
            >
              <p style={{ marginTop: "5px" }}>{formattedDateRange[0]}</p>
              <p style={{ marginTop: "5px" }}>{formattedDateRange[1]}</p>
            </h3>
          </div>
        </li>
      </li>
    </>
  );
}

export default CardItem;
