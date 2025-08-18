import { Col, Card, Table } from "react-bootstrap";

export default function AttributeBreakdown({ attributeBreakdown }) {
  return attributeBreakdown.map((attr, ind) => {
    // collect all unique keys from both maps
    const allKeys = new Set([
      ...attr.occurrencesBefore.keys(),
      ...attr.occurrencesAfter.keys(),
    ]);

    return (
      <Col sm={6} md={3} key={ind}>
        <Card>
          <Card.Header>
            <Card.Title as="h5">Attribute: {attr.attrName}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(allKeys).map((key) => {
                  const before = attr.occurrencesBefore.get(key) || 0;
                  const after = attr.occurrencesAfter.get(key) || 0;

                  let text =
                    attr.transformer == null ? key : attr.transformer(key);

                  if (attr.urlMaker != null) {
                    text = (
                      <a
                        href={`https://dashboard.internetcomputer.org${attr.urlMaker(key)}`}
                      >
                        {text}
                      </a>
                    );
                  }

                  return (
                    <tr key={key}>
                      <td>
                        <code>{text}</code>
                      </td>
                      <td>
                        {before === after ? (
                          before
                        ) : (
                          <>
                            <s>{before}</s> → {after}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    );
  });
}
