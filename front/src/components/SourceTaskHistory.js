import React from 'react';
import moment from 'moment';

import StatusSvg from './svg/StatusSvg';
import DateTime from './DateTime';
import Collapsible from './Collapsible';

export default function SourceTaskHistory({ history }) {
  return (
    <div className="container-xl">
      <div className="text-l font-bold mb-3">Task history</div>
      {history.length > 0 ? (
        <table className="w-full text-left table-collapse">
          <thead>
            <tr>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Info</TableHeader>
            </tr>
          </thead>
          <tbody className="align-baseline">
            {history.map((historyItem) => {
              const last = historyItem.state[0];
              return (
                <tr>
                  <TableCell className="w-8">
                    <StatusSvg status={last.status} />
                  </TableCell>
                  <TableCell className="w-64">
                    <DateTime date={moment(last.date).fromNow()} />
                  </TableCell>
                  <TableCell>
                    {last.stdout ? (
                      <Collapsible title="stdout">{last.stdout}</Collapsible>
                    ) : null}
                    {last.stderr ? (
                      <Collapsible title="stderr">{last.stderr}</Collapsible>
                    ) : null}
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        'This task was never executed'
      )}
    </div>
  );
}

function TableHeader(props) {
  return (
    <th className="text-sm font-semibold text-grey-darker p-2 bg-grey-lightest">
      {props.children}
    </th>
  );
}

function TableCell(props) {
  return (
    <td
      className={`p-2 border-t border-grey-light text-xs whitespace-no-wrap ${props.className ||
        ''}`}
    >
      {props.children}
    </td>
  );
}
