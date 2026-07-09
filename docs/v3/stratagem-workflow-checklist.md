# Stratagem Workflow Checklist

## 🚀 Starting a New Feature:

- [ ] 1. START → Enter the workflow with a new feature request
- [ ] 2. PF (Plan Features) → Define what needs to be built
- [ ] 3. CP (Create Plan) → Generate detailed plan.md file with task list

## 🔄 Core Execution Loop (Repeat for Each Task):

- [ ] 4. PX (Plan Execute) → Select next [ ] task from plan.md
- [ ] 5. 👤 HUMAN CHECKPOINT → Review PX strategy (Approve/Revise/Split)
- [ ] 6. AX (Approve Execute) → Implement the approved task
- [ ] 7. 👤 HUMAN REVIEW → Check implementation quality
- [ ] 8. Update plan.md → Mark task [x] with ☑️ timestamp
- [ ] 9. Decision Point → More tasks? Return to step 4. All done? Proceed to CF

## ✅ Completing the Feature:

- [ ] 10. CF (Complete Feature) → Finalize and document completion
- [ ] 11. END → Feature successfully delivered

## ⚠️ Error Handling (When Issues Arise):

- [ ] • XE (Execution Error) → Identify what went wrong
- [ ] • FX (Fix Execution) → Correct the issue
- [ ] • Return to PX → Re-plan and continue

## 📋 Resuming Work:

- [ ] • RESUME → Pick up where you left off
- [ ] • RP (Read Plan) → Load existing plan.md
- [ ] • Continue at step 4 (PX)

## 🔑 Key Points:

• Human approval required before ANY code execution (PX → AX transition) • Tasks processed one at a time in sequence • All progress tracked in plan.md • Loop continues until all tasks complete
