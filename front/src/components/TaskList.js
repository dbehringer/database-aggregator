import React, { Component } from 'react';

import { axios } from '../axios';

import AggregationTask from './AggregationTask';
import SourceTask from './SourceTask';
import TaskCard from './TaskCard';

export default class DashboardContent extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      tasks: null
    };
  }

  componentDidMount() {
    axios.get('scheduler/tasks').then(res => {
      this.setState({ tasks: res.data });
    });
  }

  render() {
    const { tasks } = this.state;
    if (tasks === null) {
      return <p>Loading</p>;
    } else {
      return (
        <section>
          <h2 className="text-center mb-10">Task list</h2>
          <div className="flex w-full">
            <div className="flex-1">
              <div className="text-center text-2xl font-bold mb-6">Sources</div>
              <div>
                {tasks.sources.map(task => (
                  <TaskCard
                    enabled={task.enabled}
                    key={task.collection}
                    status={task.status}
                  >
                    <SourceTask task={task} />
                  </TaskCard>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-center text-2xl font-bold mb-6">
                Aggregations
              </div>
              <div>
                {tasks.aggregations.map(task => (
                  <TaskCard
                    enabled={task.enabled}
                    key={task.collection}
                    status={task.status}
                  >
                    <AggregationTask task={task} />
                  </TaskCard>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}
