import mongoose from 'mongoose';
import { RequestHandler } from 'express';
import utils from '../utils';

//@ /statistic => GET
export const getStatistic: RequestHandler = (req, res, next) => {
  req.user
    .getStatistic()
    .then((statistics: any) => {
      console.log(statistics);

      res.render('statistic.ejs', {
        path: '/statistic',
        pageTitle: 'Tra cứu thông tin giờ làm - lương',
        user: req.user,
        statistics,
        helper: utils,
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
//@ /statisticsearch => GET
export const getStatisticSearch: RequestHandler = (req, res, next) => {
  //! initial keyword: All
  const search = req.query.search
    ? (req.query as { search: string }).search
    : '*';

  console.log(
    '__Debugger__ctrls__statistic__getStatisticSearch__search: ',
    search
  );
  req.user
    .getStatistic()
    .then((statistics: any) => {
      const filteredStatistics: Array<any> = statistics.filter(
        (statistic: any) => utils.matchRuleShort(statistic.date, search)
      );
      console.log('__Debugger__ctrls__statistic__getStatisticSearch__filteredStatistics: ', filteredStatistics)

      //! guard clause
      if (filteredStatistics.length > 0) {
        let salaryTimeTotal: number = 0;

        filteredStatistics.forEach((statistic) => {
          if (statistic.type === 'attendance') {
            //! only handling 'attendance'

            statistic.salaryTime = statistic.totalTime / 3600 - 8;
            const existingAbsence = statistics.find(
              (sta: any) =>
                sta.type === 'absence' && sta.date === statistic.date
            );

            if (existingAbsence) {
              console.log(
                '__Debugger__ctrls__Statistic__getStatisticSearch__existingAbsence: ',
                existingAbsence
              );
              //! Số giờ làm còn thiếu là khi chưa đủ 8h/ngày kể cả đã cộng annualLeave của ngày đó.
              if (statistic.salaryTime < 8) {
                statistic.salaryTime =
                  statistic.totalTime / 3600 + existingAbsence.hours < 8
                    ? statistic.totalTime / 3600 + existingAbsence.hours - 8
                    : 8;
              }
            }

            salaryTimeTotal += statistic.salaryTime;
          }

          console.log(
            '__Debugger__ctrls__Statistic__getStatisticSearch__attendance: ',
            statistic
          );
        });

        const salary = Math.floor(
          req.user.salaryScale * 3000000 + salaryTimeTotal * 200000
        );
        console.log(
          '__Debugger__ctrls__Statistic__getStatisticSearch__salaryTimeTotal: ',
          salaryTimeTotal
        );
        console.log(
          '__Debugger__ctrls__Statistic__getStatisticSearch__salary: ',
          salary
        );

        res.render('statistic-search.ejs', {
          path: '/statisticsearch',
          pageTitle: 'Tra cứu thông tin giờ làm - lương',
          user: req.user,
          statistics: filteredStatistics,
          salary: salary,
          salaryTimeTotal,
          helper: utils,
        });
      } else {
        res.render('statistic-search.ejs', {
          path: '/statisticsearch',
          pageTitle: 'Tra cứu thông tin giờ làm - lương',
          user: req.user,
          statistics: [],
          salary: 0,
          salaryTimeTotal: 0,
          helper: utils,
        });
      }
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

