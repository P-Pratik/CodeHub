from data_sync.contest_sync import lc_sync
from data_sync.contest_sync import gfg_sync
from app.utils import contest
import pprint as pp

# print(gfg_sync.populateContestCol())
# print(lc_sync.populateContestCol()) 
pp.pprint(contest.getPastContests(1))