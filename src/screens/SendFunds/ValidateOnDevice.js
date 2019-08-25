// @flow
import React, { PureComponent, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Trans } from "react-i18next";
import { BigNumber } from "bignumber.js";
import type {
  Unit,
  TokenAccount,
  Account,
  Transaction,
} from "@ledgerhq/live-common/lib/types";
import {
  getMainAccount,
  getAccountUnit,
} from "@ledgerhq/live-common/lib/account";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import type { DeviceModelId } from "@ledgerhq/devices";
import { getDeviceModel } from "@ledgerhq/devices";

import colors from "../../colors";

import LText from "../../components/LText";
import DeviceNanoAction from "../../components/DeviceNanoAction";
import VerifyAddressDisclaimer from "../../components/VerifyAddressDisclaimer";
import CurrencyUnitValue from "../../components/CurrencyUnitValue";
import getWindowDimensions from "../../logic/getWindowDimensions";

type Props = {
  modelId: DeviceModelId,
  transaction: Transaction,
  account: Account | TokenAccount,
  parentAccount: ?Account,
  wired: boolean,
};

const { width } = getWindowDimensions();

class DataRow extends PureComponent<{
  label: *,
  value: BigNumber,
  unit: Unit,
}> {
  render() {
    const { label, value, unit } = this.props;
    return (
      <View style={styles.dataRow}>
        <LText numberOfLines={1} style={styles.dataRowLabel}>
          {label}
        </LText>
        <LText tertiary style={styles.dataRowValue}>
          <CurrencyUnitValue unit={unit} value={value} disableRounding />
        </LText>
      </View>
    );
  }
}

const ValidateOnDevice = ({
  account,
  parentAccount,
  modelId,
  wired,
  transaction,
}: Props) => {
  const [transactionStatus, setTransactionStatus] = useState(null);
  useEffect(() => {
    const bridge = getAccountBridge(account, parentAccount);
    const mainAccount = getMainAccount(account, parentAccount);
    let finished;
    bridge.getTransactionStatus(mainAccount, transaction).then(ts => {
      if (!finished) {
        setTransactionStatus(ts);
      }
    });
    return () => {
      finished = true;
    };
  }, [transaction, account, parentAccount]);

  const mainAccount = getMainAccount(account, parentAccount);
  const unit = getAccountUnit(account);
  const amount = transactionStatus ? transactionStatus.amount : BigNumber(0);
  const fees = transactionStatus
    ? transactionStatus.estimatedFees
    : BigNumber(0);

  return (
    <View style={styles.root}>
      <View style={styles.innerContainer}>
        <View style={styles.picture}>
          <DeviceNanoAction
            modelId={modelId}
            wired={wired}
            action="accept"
            width={width * 0.8}
            screen="validation"
          />
        </View>
        <View style={styles.titleContainer}>
          <LText secondary semiBold style={styles.title}>
            <Trans
              i18nKey="send.validation.title"
              values={getDeviceModel(modelId)}
            />
          </LText>
        </View>

        <View style={styles.dataRows}>
          <DataRow
            label={<Trans i18nKey="send.validation.amount" />}
            unit={unit}
            value={amount}
          />
          <DataRow
            label={<Trans i18nKey="send.validation.fees" />}
            unit={mainAccount.unit}
            value={fees}
          />
        </View>
      </View>

      <VerifyAddressDisclaimer
        text={<Trans i18nKey="send.validation.disclaimer" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
  dataRows: {
    marginVertical: 24,
    alignSelf: "stretch",
  },
  dataRow: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: colors.lightGrey,
    alignItems: "center",
    flexDirection: "row",
  },
  dataRowLabel: {
    color: colors.grey,
    textAlign: "left",
    fontSize: 14,
    paddingRight: 16,
  },
  dataRowValue: {
    color: colors.darkBlue,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  picture: {
    marginBottom: 40,
  },
  titleContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    color: colors.darkBlue,
    textAlign: "center",
  },
});

export default ValidateOnDevice;
